import { isEmpty } from "./isEmpty"

type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits = 2,
  maximumFractionDigits = 2,
  locale = "en-US",
}: ConvertToLocaleParams) => {
  if (!currency_code || isEmpty(currency_code)) {
    return amount.toString()
  }

  // Hardcode "en-US" so that Node.js server-side ICU configuration differences
  // (Railway, Docker, small-icu builds) cannot produce comma decimal separators
  // or accounting-style parentheses. The locale param is preserved for any
  // explicit caller override but en-US is the store default.
  const resolvedLocale = locale || "en-US"

  return new Intl.NumberFormat(resolvedLocale, {
    style: "currency",
    currency: currency_code.toUpperCase(),
    minimumFractionDigits,
    maximumFractionDigits,
    // Prevent accounting-style (negative) parens — always use standard minus sign
    currencySign: "standard",
  }).format(amount)
}
