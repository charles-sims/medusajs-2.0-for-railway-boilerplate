import { AbstractPaymentProvider, PaymentActions, BigNumber, MedusaError } from "@medusajs/framework/utils"
import type { Logger } from "@medusajs/framework/types"
import type {
  InitiatePaymentInput, InitiatePaymentOutput,
  AuthorizePaymentInput, AuthorizePaymentOutput,
  CapturePaymentInput, CapturePaymentOutput,
  RefundPaymentInput, RefundPaymentOutput,
  CancelPaymentInput, CancelPaymentOutput,
  DeletePaymentInput, DeletePaymentOutput,
  UpdatePaymentInput, UpdatePaymentOutput,
  GetPaymentStatusInput, GetPaymentStatusOutput,
  RetrievePaymentInput, RetrievePaymentOutput,
  ProviderWebhookPayload, WebhookActionResult,
} from "@medusajs/framework/types"
import type { NmiCardOptions, NmiTransactionRequest, NmiTransactionResponse } from "./types"

const SANDBOX_ENDPOINT = "https://sandbox.nmi.com/api/transact.php"
const PRODUCTION_ENDPOINT = "https://secure.nmi.com/api/transact.php"

type InjectedDependencies = { logger: Logger }

class NmiCardPaymentProviderService extends AbstractPaymentProvider<NmiCardOptions> {
  static identifier = "nmi-card"

  protected logger_: Logger
  protected options_: NmiCardOptions
  protected endpoint_: string

  constructor(container: InjectedDependencies, options: NmiCardOptions) {
    super(container, options)
    this.logger_ = container.logger
    this.options_ = options
    this.endpoint_ = options.endpoint
      || (process.env.NMI_SANDBOX === "true" ? SANDBOX_ENDPOINT : PRODUCTION_ENDPOINT)
  }

  private async transact(params: NmiTransactionRequest): Promise<NmiTransactionResponse> {
    const body = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) body.append(key, value)
    }
    const response = await fetch(this.endpoint_, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    })
    const text = await response.text()
    const parsed = Object.fromEntries(new URLSearchParams(text)) as unknown as NmiTransactionResponse
    this.logger_.debug(`NMI card ${params.type}: ${parsed.response} - ${parsed.responsetext} (txn: ${parsed.transactionid})`)
    return parsed
  }

  /**
   * Called when customer selects card payment. Returns tokenization key
   * so the storefront can use Collect.js to tokenize the card.
   */
  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const { amount, currency_code, context, data } = input
    return {
      id: `nmi_card_${Date.now()}`,
      data: {
        amount: amount.toString(),
        currency_code,
        tokenization_key: this.options_.tokenizationKey || null,
        customer_email: (context?.customer as Record<string, unknown>)?.email as string || null,
        status: "pending",
        // Pass through raw card fields for testing (Collect.js token preferred in production)
        ...(data?.ccnumber ? {
          ccnumber: data.ccnumber,
          ccexp: data.ccexp,
          cvv: data.cvv,
        } : {}),
        ...(data?.payment_token ? { payment_token: data.payment_token } : {}),
      },
    }
  }

  /**
   * Called during cart completion. Runs an auth (not a capture) so funds
   * are held but not settled until fulfillment.
   * Supports Collect.js token (production) or raw card fields (testing).
   */
  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    const data = input.data || {}

    const params: NmiTransactionRequest = {
      security_key: this.options_.apiKey,
      type: "auth",
      payment: "creditcard",
      amount: data.amount as string,
      currency: (data.currency_code as string)?.toUpperCase() || "USD",
      orderid: (data.session_id as string) || undefined,
    }

    if (data.payment_token) {
      params.payment_token = data.payment_token as string
    } else if (data.ccnumber) {
      // Raw card fields — testing only
      params.ccnumber = data.ccnumber as string
      params.ccexp = data.ccexp as string
      if (data.cvv) params.cvv = data.cvv as string
    } else {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Card payment requires payment_token (Collect.js) or raw card fields (ccnumber, ccexp)"
      )
    }

    if (data.first_name) params.first_name = data.first_name as string
    if (data.last_name) params.last_name = data.last_name as string
    if (data.email) params.email = data.email as string

    const result = await this.transact(params)

    if (result.response !== "1") {
      this.logger_.error(`NMI card auth failed: ${result.responsetext} (code: ${result.response_code})`)
      return {
        status: "error",
        data: {
          ...data,
          nmi_transaction_id: result.transactionid,
          nmi_response: result.responsetext,
          nmi_response_code: result.response_code,
        },
      }
    }

    return {
      status: "authorized",
      data: {
        nmi_transaction_id: result.transactionid,
        nmi_auth_code: result.authcode,
        nmi_response: result.responsetext,
        amount: data.amount,
        currency_code: data.currency_code,
      },
    }
  }

  /**
   * Called when an order is fulfilled. Captures the previously authorized amount.
   */
  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    const data = input.data || {}
    const transactionId = data.nmi_transaction_id as string

    if (!transactionId) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Cannot capture: missing NMI transaction ID")
    }

    const result = await this.transact({
      security_key: this.options_.apiKey,
      type: "capture",
      transactionid: transactionId,
      amount: (input as any).amount?.toString(),
    })

    if (result.response !== "1") {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `NMI capture failed: ${result.responsetext} (code: ${result.response_code})`
      )
    }

    return {
      data: {
        ...data,
        captured: true,
        capture_transaction_id: result.transactionid,
      },
    }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const data = input.data || {}
    const transactionId = data.nmi_transaction_id as string

    if (!transactionId) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Cannot refund: missing NMI transaction ID")
    }

    const result = await this.transact({
      security_key: this.options_.apiKey,
      type: "refund",
      transactionid: transactionId,
      amount: input.amount?.toString(),
    })

    if (result.response !== "1") {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `NMI refund failed: ${result.responsetext} (code: ${result.response_code})`
      )
    }

    return {
      data: {
        ...data,
        refund_transaction_id: result.transactionid,
        refund_response: result.responsetext,
      },
    }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    const data = input.data || {}
    const transactionId = data.nmi_transaction_id as string

    if (!transactionId) {
      return { data: { ...data, cancelled: true } }
    }

    const result = await this.transact({
      security_key: this.options_.apiKey,
      type: "void",
      transactionid: transactionId,
    })

    if (result.response !== "1") {
      this.logger_.warn(`NMI void failed (may already be settled): ${result.responsetext}`)
    }

    return {
      data: {
        ...data,
        void_transaction_id: result.transactionid,
        cancelled: true,
      },
    }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return { data: input.data || {} }
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    const data = input.data || {}
    return {
      data: {
        ...data,
        amount: input.amount?.toString() || data.amount,
        currency_code: input.currency_code || data.currency_code,
      },
    }
  }

  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    const data = input.data || {}
    if (data.captured) return { status: "captured" }
    if (data.nmi_transaction_id) return { status: "authorized" }
    return { status: "pending" }
  }

  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    return { data: input.data || {} }
  }

  async getWebhookActionAndData(payload: ProviderWebhookPayload["payload"]): Promise<WebhookActionResult> {
    return {
      action: PaymentActions.NOT_SUPPORTED,
      data: { session_id: "", amount: new BigNumber(0) },
    }
  }
}

export default NmiCardPaymentProviderService
