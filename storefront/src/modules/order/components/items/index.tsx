import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { Table } from "@medusajs/ui"

import Divider from "@modules/common/components/divider"
import Item from "@modules/order/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsProps = {
  items: HttpTypes.StoreCartLineItem[] | HttpTypes.StoreOrderLineItem[] | null
}

const groupOrderItems = (items: any[]) => {
  if (!items) return []
  
  const groups: Record<string, any> = {}
  
  for (const item of items) {
    const variantId = item.variant_id || item.variant?.id
    const recipe = item.metadata?.recipe as any
    
    let designKey = `${variantId}_standard`
    if (recipe) {
      const cleanLayers = (recipe.layers || []).map((l: any) => ({
        type: l.type,
        props: l.props,
        view: l.view
      }))
      designKey = `${variantId}_custom_${JSON.stringify(cleanLayers)}`
    }
    
    if (!groups[designKey]) {
      groups[designKey] = {
        ...item,
        crew_members: item.metadata?.crew_member ? [item.metadata.crew_member] : [],
        original_item_ids: [item.id],
      }
    } else {
      groups[designKey].quantity = Number(groups[designKey].quantity) + Number(item.quantity)
      if (groups[designKey].total !== undefined && item.total !== undefined) {
        groups[designKey].total = Number(groups[designKey].total) + Number(item.total)
      }
      if (item.adjustments) {
        groups[designKey].adjustments = [
          ...(groups[designKey].adjustments || []),
          ...item.adjustments
        ]
      }
      if (item.metadata?.crew_member) {
        groups[designKey].crew_members.push(item.metadata.crew_member)
      }
      groups[designKey].original_item_ids.push(item.id)
    }
  }
  
  return Object.values(groups)
}

const Items = ({ items }: ItemsProps) => {
  const groupedItems = groupOrderItems(items || [])

  return (
    <div className="flex flex-col">
      <Divider className="!mb-0" />
      <Table>
        <Table.Body data-testid="products-table">
          {groupedItems?.length
            ? groupedItems
                .sort((a, b) => {
                  return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                })
                .map((item) => {
                  return <Item key={item.id} item={item} />
                })
            : repeat(5).map((i) => {
                return <SkeletonLineItem key={i} />
              })}
        </Table.Body>
      </Table>
    </div>
  )
}

export default Items
