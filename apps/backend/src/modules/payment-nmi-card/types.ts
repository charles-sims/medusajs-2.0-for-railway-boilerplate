export type NmiCardOptions = {
  apiKey: string
  tokenizationKey?: string
  endpoint?: string
}

export type NmiTransactionRequest = {
  security_key: string
  type: "sale" | "auth" | "capture" | "void" | "refund"
  amount?: string
  payment?: "creditcard"
  // Raw card fields (testing only — production must use payment_token)
  ccnumber?: string
  ccexp?: string
  cvv?: string
  // Collect.js token
  payment_token?: string
  // For capture/void/refund
  transactionid?: string
  orderid?: string
  currency?: string
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
  [key: string]: string | undefined
}
