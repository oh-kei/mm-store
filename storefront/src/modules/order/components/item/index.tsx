import { HttpTypes } from "@medusajs/types"
import { Table, Text } from "@medusajs/ui"

import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import Thumbnail from "@modules/products/components/thumbnail"
import { getVariantImage } from "@modules/products/utils/get-variant-image"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
}

const Item = ({ item }: ItemProps) => {
  const variantImage = getVariantImage(item.variant as any)
  const recipe = item.metadata?.recipe as any

  return (
    <Table.Row className="w-full" data-testid="product-row">
      <Table.Cell className="!pl-0 p-4 w-24 align-top">
        <div className="flex w-16">
          <Thumbnail 
            thumbnail={variantImage || item.variant?.thumbnail || (item.variant?.metadata?.image as string) || item.thumbnail} 
            size="square" 
          />
        </div>
      </Table.Cell>

      <Table.Cell className="text-left align-top">
        <Text
          className="txt-medium-plus text-ui-fg-base"
          data-testid="product-name"
        >
          {item.title}
        </Text>
        {item.variant && (
          <LineItemOptions variant={item.variant} data-testid="product-variant" />
        )}
        
        {/* Custom Design Details */}
        {recipe && (
          <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 max-w-md">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-maritime-gold text-white text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full">Custom Design</span>
              {item.metadata?.crew_member && (
                <div className="flex items-center gap-1.5 text-maritime-navy">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span className="text-[9px] font-black uppercase tracking-widest">{item.metadata.crew_member as string}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
               {/* Design Snapshot if available */}
               {item.metadata?.preview_url && (
                 <div className="mb-4">
                   <p className="text-[9px] font-black uppercase tracking-widest text-maritime-gold mb-2">Design Preview</p>
                   <img 
                    src={item.metadata.preview_url as string} 
                    alt="Design Preview" 
                    className="w-full aspect-square object-contain bg-white rounded-xl border border-slate-100 shadow-sm"
                   />
                 </div>
               )}

               {recipe.layers?.map((layer: any) => (
                 <div key={layer.id} className="flex items-start gap-3 border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {layer.type === 'text' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
                      ) : (
                        <img src={layer.props.url} className="w-full h-full object-contain p-1" alt="Logo" />
                      )}
                    </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-slate-900 uppercase tracking-tight truncate">
                        {layer.type === 'text' ? `"${layer.props.text}"` : 'Logo Asset'}
                      </p>
                      {layer.type === 'text' && (
                        <p className="text-[9px] text-slate-400 font-medium">
                          {layer.props.fontFamily} | {layer.props.fill}
                        </p>
                      )}
                   </div>
                 </div>
               ))}
            </div>
          </div>
        )}
      </Table.Cell>

      <Table.Cell className="!pr-0">
        <span className="!pr-0 flex flex-col items-end h-full justify-center">
          <span className="flex gap-x-1 ">
            <Text className="text-ui-fg-muted">
              <span data-testid="product-quantity">{item.quantity}</span>x{" "}
            </Text>
            <LineItemUnitPrice item={item} style="tight" />
          </span>

          <LineItemPrice item={item} style="tight" />
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
