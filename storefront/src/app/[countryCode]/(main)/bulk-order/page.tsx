import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function BulkOrderPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] pt-40 pb-20 px-8 flex flex-col items-center text-center text-white">
      <div className="max-w-2xl">
        <span className="text-xs font-black uppercase tracking-[0.3em] text-white/40 mb-4 block">Fleet Solutions</span>
        <Heading className="text-5xl md:text-7xl font-black text-white mb-8 uppercase tracking-tighter">
          Bulk Orders
        </Heading>
        <div className="h-1 w-20 bg-maritime-gold mx-auto mb-12" />
        <Text className="text-lg text-slate-300 mb-12 leading-relaxed">
          Outfit your entire crew with premium Mariners Market gear. We offer tiered pricing and custom branding for large volume orders. Contact our fleet relations team to start your quote.
        </Text>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="mailto:fleet@marinersmarket.com" 
            className="bg-white text-[#0F172A] px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-slate-200 transition-all shadow-xl"
          >
            Contact Fleet Sales
          </a>
          <LocalizedClientLink 
            href="/catalog" 
            className="border border-white/20 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
          >
            Browse Products
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
