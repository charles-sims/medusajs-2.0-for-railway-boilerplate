export default function medusaError(error: any): never {
  // Medusa JS SDK throws errors with message directly
  const message =
    error?.response?.data?.message ||
    error?.response?.data ||
    error?.message ||
    "An unknown error occurred"

  const formatted =
    typeof message === "string"
      ? message.charAt(0).toUpperCase() + message.slice(1)
      : String(message)

  throw new Error(formatted)
}
