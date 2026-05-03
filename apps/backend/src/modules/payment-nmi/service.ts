import { AbstractPaymentProvider, PaymentActions, BigNumber, MedusaError } from "@medusajs/framework/utils"
import type {
  Logger,
} from "@medusajs/framework/types"
import type {
  InitiatePaymentInput,
  InitiatePaymentOutput,
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  RefundPaymentInput,
  RefundPaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  ProviderWebhookPayload,
  WebhookActionResult,
} from "@medusajs/framework/types"
import type { NmiOptions, NmiTransactionRequest, NmiTransactionResponse } from "./types"

const SANDBOX_ENDPOINT = "https://sandbox.nmi.com/api/transact.php"
const PRODUCTION_ENDPOINT = "https://secure.nmi.com/api/transact.php"

type InjectedDependencies = {
  logger: Logger
}

class NmiAchPaymentProviderService extends AbstractPaymentProvider<NmiOptions> {
  static identifier = "nmi-ach"

  protected logger_: Logger
  protected options_: NmiOptions
  protected endpoint_: string

  constructor(container: InjectedDependencies, options: NmiOptions) {
    super(container, options)
    this.logger_ = container.logger
    this.options_ = options
    this.endpoint_ = options.endpoint
      || (process.env.NMI_SANDBOX === "true" ? SANDBOX_ENDPOINT : PRODUCTION_ENDPOINT)
  }

  /**
   * POST form-encoded data to NMI and parse the URL-encoded response.
   */
  private async transact(
    params: NmiTransactionRequest
  ): Promise<NmiTransactionResponse> {
    const body = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        body.append(key, value)
      }
    }

    const response = await fetch(this.endpoint_, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    })

    const text = await response.text()
    const parsed = Object.fromEntries(
      new URLSearchParams(text)
    ) as unknown as NmiTransactionResponse

    this.logger_.debug(
      `NMI ${params.type} response: ${parsed.response} - ${parsed.responsetext} (txn: ${parsed.transactionid})`
    )

    return parsed
  }

  /**
   * Called when customer selects ACH as payment method.
   * We don't hit NMI yet — just return the tokenization key
   * so the storefront can use Collect.js to tokenize bank details.
   */
  async initiatePayment(
    input: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput> {
    const { amount, currency_code, context, data } = input

    return {
      id: `nmi_session_${Date.now()}`,
      data: {
        amount: amount.toString(),
        currency_code,
        // Public tokenization key for Collect.js on the storefront.
        // This is safe to expose — it can only tokenize, not charge.
        tokenization_key: this.options_.tokenizationKey || null,
        customer_email: (context?.customer as Record<string, unknown>)?.email as string || null,
        status: "pending",
        // Bank details passed from storefront via data param.
        // Stored here so they flow to authorizePayment's input.data.
        ...(data?.checkname ? {
          checkname: data.checkname,
          checkaba: data.checkaba,
          checkaccount: data.checkaccount,
          account_type: data.account_type || "checking",
        } : {}),
      },
    }
  }

  /**
   * Called during cart completion. The storefront must pass either:
   * - payment_token (from Collect.js tokenization — preferred)
   * - OR raw bank details: checkname, checkaba, checkaccount, account_type
   *
   * ACH doesn't support auth-then-capture, so we run a sale directly.
   */
  async authorizePayment(
    input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    const data = input.data || {}

    const params: NmiTransactionRequest = {
      security_key: this.options_.apiKey,
      type: "sale",
      payment: "check",
      amount: data.amount as string,
      currency: (data.currency_code as string) || "USD",
      sec_code: "WEB", // Web-initiated consumer payment
      orderid: (data.session_id as string) || undefined,
    }

    // Prefer Collect.js token over raw bank details
    if (data.payment_token) {
      params.payment_token = data.payment_token as string
    } else {
      // Direct bank details (testing / fallback)
      if (!data.checkname || !data.checkaba || !data.checkaccount) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "ACH payment requires payment_token or bank details (checkname, checkaba, checkaccount)"
        )
      }
      params.checkname = data.checkname as string
      params.checkaba = data.checkaba as string
      params.checkaccount = data.checkaccount as string
      params.account_type = (data.account_type as "checking" | "savings") || "checking"
      params.account_holder_type = (data.account_holder_type as "business" | "personal") || "personal"
    }

    // Pass billing info if available
    if (data.first_name) params.first_name = data.first_name as string
    if (data.last_name) params.last_name = data.last_name as string
    if (data.email) params.email = data.email as string

    const result = await this.transact(params)

    if (result.response !== "1") {
      this.logger_.error(
        `NMI ACH sale failed: ${result.responsetext} (code: ${result.response_code})`
      )
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

    // ACH sale was accepted (note: ACH settlement takes 3-5 business days,
    // but NMI returns success on submission)
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
   * ACH payments are captured at sale time. This is effectively a no-op
   * that confirms the transaction is settled.
   */
  async capturePayment(
    input: CapturePaymentInput
  ): Promise<CapturePaymentOutput> {
    const data = input.data || {}

    // ACH is already captured via the sale in authorizePayment.
    // If you need to verify status, you could query NMI here.
    return {
      data: {
        ...data,
        captured: true,
      },
    }
  }

  /**
   * Refund a previously completed ACH transaction.
   */
  async refundPayment(
    input: RefundPaymentInput
  ): Promise<RefundPaymentOutput> {
    const data = input.data || {}
    const transactionId = data.nmi_transaction_id as string

    if (!transactionId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Cannot refund: missing NMI transaction ID"
      )
    }

    const result = await this.transact({
      security_key: this.options_.apiKey,
      type: "refund",
      transactionid: transactionId,
      payment: "check",
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

  /**
   * Void a pending ACH transaction (before settlement).
   */
  async cancelPayment(
    input: CancelPaymentInput
  ): Promise<CancelPaymentOutput> {
    const data = input.data || {}
    const transactionId = data.nmi_transaction_id as string

    if (!transactionId) {
      // No NMI transaction to void — just acknowledge cancellation
      return { data: { ...data, cancelled: true } }
    }

    const result = await this.transact({
      security_key: this.options_.apiKey,
      type: "void",
      transactionid: transactionId,
      payment: "check",
    })

    if (result.response !== "1") {
      this.logger_.warn(
        `NMI void failed (may already be settled): ${result.responsetext}`
      )
    }

    return {
      data: {
        ...data,
        void_transaction_id: result.transactionid,
        void_response: result.responsetext,
        cancelled: true,
      },
    }
  }

  /**
   * Delete/clean up a payment session. No NMI action needed.
   */
  async deletePayment(
    input: DeletePaymentInput
  ): Promise<DeletePaymentOutput> {
    return { data: input.data || {} }
  }

  /**
   * Update a payment session (e.g., amount changed). No NMI action needed
   * since we don't create anything in NMI until authorization.
   */
  async updatePayment(
    input: UpdatePaymentInput
  ): Promise<UpdatePaymentOutput> {
    const data = input.data || {}
    return {
      data: {
        ...data,
        amount: input.amount?.toString() || data.amount,
        currency_code: input.currency_code || data.currency_code,
      },
    }
  }

  /**
   * Check payment status. For ACH, settlement is async (3-5 days),
   * so we report based on what we know from the sale response.
   */
  async getPaymentStatus(
    input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    const data = input.data || {}

    if (data.nmi_transaction_id) {
      return { status: "authorized" }
    }

    return { status: "pending" }
  }

  /**
   * Retrieve payment details from stored data.
   */
  async retrievePayment(
    input: RetrievePaymentInput
  ): Promise<RetrievePaymentOutput> {
    return { data: input.data || {} }
  }

  /**
   * Handle webhook events from NMI.
   * Webhook URL: /hooks/payment/nmi-ach_nmi-ach
   *
   * NMI can send transaction status updates for ACH settlements,
   * returns, and failures.
   */
  async getWebhookActionAndData(
    payload: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    const { data } = payload

    try {
      const eventType = (data as Record<string, unknown>)?.event_type as string
      const sessionId = (data as Record<string, unknown>)?.session_id as string
      const amount = (data as Record<string, unknown>)?.amount as number

      if (!sessionId) {
        return {
          action: PaymentActions.NOT_SUPPORTED,
          data: { session_id: "", amount: new BigNumber(0) },
        }
      }

      const payloadData = {
        session_id: sessionId,
        amount: new BigNumber(amount || 0),
      }

      switch (eventType) {
        case "transaction.settled":
          return { action: PaymentActions.SUCCESSFUL, data: payloadData }
        case "transaction.failed":
        case "transaction.returned":
          return { action: PaymentActions.FAILED, data: payloadData }
        default:
          return { action: PaymentActions.NOT_SUPPORTED, data: payloadData }
      }
    } catch (error) {
      this.logger_.error(`NMI webhook error: ${error}`)
      return {
        action: PaymentActions.FAILED,
        data: { session_id: "", amount: new BigNumber(0) },
      }
    }
  }
}

export default NmiAchPaymentProviderService
