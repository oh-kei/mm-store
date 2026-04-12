import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function CustomStudioPage() {
  return (
    <div className="min-h-screen bg-white pt-40 pb-20 px-8 flex flex-col items-center text-center">
      <div className="max-w-2xl">
        <span className="text-xs font-black uppercase tracking-[0.3em] text-maritime-navy/40 mb-4 block">Design Your Gear</span>
        <Heading className="text-5xl md:text-7xl font-black text-maritime-navy mb-8 uppercase tracking-tighter">
          Custom Studio
        </Heading>
        <div className="h-1 w-20 bg-maritime-gold mx-auto mb-12" />
        <Text className="text-lg text-slate-600 mb-12 leading-relaxed">
          Our design lab is currently being outfitted with the latest tools to help you create bespoke maritime apparel. Join our mailing list to be the first to know when we launch.
        </Text>
        <LocalizedClientLink 
          href="/catalog" 
          className="inline-block bg-maritime-navy text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-maritime-navy/90 transition-all shadow-xl hover:shadow-maritime-navy/20"
        >
          Explore Collection
        </LocalizedClientLink>
      </div>
    </div>
  )
}
