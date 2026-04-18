import { Container, Button, Heading, Text } from "@medusajs/ui"
import { Users, ArrowRight, UserPlus } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type CrewProps = {
  customer: HttpTypes.StoreCustomer | null
}

const CrewTemplate = ({ customer }: CrewProps) => {
  const roster = Array.isArray(customer?.metadata?.roster) ? (customer.metadata.roster as any[]) : []

  return (
    <div className="w-full" data-testid="crew-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Crew</h1>
        <p className="text-base-regular">
          Manage your vessel's roster of crew members. This list is used for quick bulk ordering and sizing management.
        </p>
      </div>

      <div className="flex flex-col gap-y-8 w-full">
        <div className="flex justify-between items-center">
          <h3 className="text-large-semi flex items-center gap-x-2">
            <Users size={20} className="text-ui-fg-subtle" />
            Your Roster
          </h3>
          <LocalizedClientLink href="/bulk-order">
            <Button variant="secondary" className="flex items-center gap-x-2">
              <UserPlus size={16} />
              Manage Crew
            </Button>
          </LocalizedClientLink>
        </div>

        {roster.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roster.map((member, index) => (
              <Container 
                key={`${member.name}-${index}`}
                className="bg-gray-50/50 p-4 border border-gray-100 flex items-center justify-between group"
              >
                <div className="flex items-center gap-x-4">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold uppercase text-xs">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-tight">{member.name}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Size: {member.size}</p>
                  </div>
                </div>
              </Container>
            ))}
          </div>
        ) : (
          <Container className="bg-gray-50/50 p-12 flex flex-col items-center justify-center text-center border-dashed border-2">
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-4">
              <Users size={32} />
            </div>
            <Heading level="h2" className="text-xl mb-2">No Crew Members Yet</Heading>
            <Text className="text-ui-fg-subtle max-w-[300px] mb-8">
              Start by adding your crew members to your roster for easier bulk orders.
            </Text>
            <LocalizedClientLink href="/bulk-order">
              <Button variant="primary" className="flex items-center gap-x-2">
                Go to Bulk Order Portal
                <ArrowRight size={16} />
              </Button>
            </LocalizedClientLink>
          </Container>
        )}
      </div>
    </div>
  )
}

export default CrewTemplate
