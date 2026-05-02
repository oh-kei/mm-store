import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "Sign in | Mariners Market's",
  description: "Sign in to your Mariners Market's account.",
}

export default function Login() {
  return <LoginTemplate />
}
