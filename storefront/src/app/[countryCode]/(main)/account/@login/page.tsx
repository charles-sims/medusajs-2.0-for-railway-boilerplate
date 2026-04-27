import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "Sign in | CaliLean",
  description: "Sign in to your CaliLean account.",
}

export default function Login() {
  return <LoginTemplate />
}
