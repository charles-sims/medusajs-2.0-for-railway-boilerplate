import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Enter | CaliLean",
  description: "Sign in or create an account to continue.",
}

export default function GateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
