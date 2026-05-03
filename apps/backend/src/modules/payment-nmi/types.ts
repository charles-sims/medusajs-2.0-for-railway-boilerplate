export type NmiOptions = {
  /**
   * NMI API security key (Merchant Key with "api" permission).
   * Use sandbox key for testing, production key for live.
   */
  apiKey: string
  /**
   * NMI Collect.js tokenization key (public).
   * Passed to the storefront for client-side bank detail tokenization.
   */
  tokenizationKey?: string
  /**
   * NMI API endpoint. Defaults to sandbox.
   * Production: https://secure.nmi.com/api/transact.php
   * Sandbox:    https://sandbox.nmi.com/api/transact.php
   */
  endpoint?: string
  /**
   * Whether to auto-capture ACH payments on authorization.
   * ACH doesn't support auth-then-capture, so this defaults to true.
   */
  capture?: boolean
}

export type NmiTransactionRequest = {
  security_key: string
  type: "sale" | "auth" | "capture" | "void" | "refund"
  amount?: string
  payment?: "check" | "creditcard"
  // ACH fields
  checkname?: string
  checkaba?: string
  checkaccount?: string
  account_holder_type?: "business" | "personal"
  account_type?: "checking" | "savings"
  sec_code?: "PPD" | "WEB" | "TEL" | "CCD"
  // Token from Collect.js
  payment_token?: string
  // For capture/void/refund
  transactionid?: string
  // Order reference
  orderid?: string
  currency?: string
  // Billing info
  first_name?: string
  last_name?: string
  email?: string
  [key: string]: string | undefined
}

export type NmiTransactionResponse = {
  response: "1" | "2" | "3"
  responsetext: string
  response_code: string
  transactionid: string
  authcode: string
  avsresponse?: string
  cvvresponse?: string
  type?: string
  [key: string]: string | undefined
}
