import { Metadata } from "next"
import { getCustomer } from "@lib/data/customer"
import { notFound } from "next/navigation"
import CrewTemplate from "@modules/account/components/crew"

export const metadata: Metadata = {
  title: "Crew",
  description: "Manage your crew roster.",
}

export default async function CrewPage() {
  const customer = await getCustomer().catch(() => null)

  if (!customer) {
    notFound()
  }

  return <CrewTemplate customer={customer} />
}
