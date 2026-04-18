import { redirect } from "next/navigation"

export default async function OverviewTemplate() {
  redirect("/account/profile")
}
