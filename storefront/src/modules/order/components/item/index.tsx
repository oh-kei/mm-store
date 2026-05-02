import { HttpTypes } from "@medusajs/types"
import { Table, Text } from "@medusajs/ui"

import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import Thumbnail from "@modules/products/components/thumbnail"
import { getVariantImage } from "@modules/products/utils/get-variant-image"
import { Type, Image as ImageIcon, User } from "lucide-react"

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
                  <User size={10} />
                  <span className="text-[9px] font-black uppercase tracking-widest">{item.metadata.crew_member as string}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
               {recipe.layers?.map((layer: any) => (
                 <div key={layer.id} className="flex items-start gap-3 border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                   <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {layer.type === 'text' ? (
                        <Type size={14} className="text-slate-400" />
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
                      {layer.type === 'image' && (
                        <p className="text-[8px] text-slate-300 font-medium truncate">
                          ID: {layer.props.originalAsset || 'External'}
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
