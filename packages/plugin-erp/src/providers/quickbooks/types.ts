export type QboOptions = {
  client_id: string
  client_secret: string
  redirect_uri: string
  environment: "sandbox" | "production"
}

export type QboSalesReceipt = {
  Id?: string
  CustomerRef: { value: string }
  TxnDate: string
  Line: QboLine[]
  CurrencyRef: { value: string }
  PrivateNote?: string
  CustomField?: { DefinitionId: string; StringValue: string }[]
}

export type QboLine = {
  Amount: number
  DetailType: "SalesItemLineDetail" | "SubTotalLineDetail" | "DiscountLineDetail"
  SalesItemLineDetail?: {
    ItemRef: { value: string; name?: string }
    Qty: number
    UnitPrice: number
    TaxCodeRef?: { value: string }
  }
  Description?: string
}

export type QboCustomer = {
  Id?: string
  DisplayName: string
  PrimaryEmailAddr?: { Address: string }
  PrimaryPhone?: { FreeFormNumber: string }
  BillAddr?: {
    Line1?: string
    City?: string
    CountrySubDivisionCode?: string
    PostalCode?: string
    Country?: string
  }
  Active?: boolean
}

export type QboItem = {
  Id?: string
  Name: string
  Sku?: string
  Type: "NonInventory" | "Inventory" | "Service"
  IncomeAccountRef: { value: string }
  Active?: boolean
}

export type QboInvoice = {
  Id?: string
  CustomerRef: { value: string }
  TxnDate: string
  DueDate?: string
  Line: QboLine[]
  CurrencyRef: { value: string }
  PrivateNote?: string
}

export type QboPayment = {
  Id?: string
  CustomerRef: { value: string }
  TotalAmt: number
  CurrencyRef: { value: string }
  Line: {
    Amount: number
    LinkedTxn: { TxnId: string; TxnType: "Invoice" }[]
  }[]
  PrivateNote?: string
}

export type QboRefundReceipt = {
  Id?: string
  CustomerRef: { value: string }
  Line: QboLine[]
  CurrencyRef: { value: string }
  PrivateNote?: string
}
