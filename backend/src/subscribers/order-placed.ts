import { Modules } from '@medusajs/framework/utils'
import { INotificationModuleService, IOrderModuleService } from '@medusajs/framework/types'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa'
import { EmailTemplates } from '../modules/email-notifications/templates'

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)
  
  console.log(`[OrderPlacedSubscriber] Processing order: ${data.id}`)
  
  try {
    const query = container.resolve("query")
    const { data: [order] } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "created_at",
        "email",
        "currency_code",
        "total",
        "subtotal",
        "items.*",
        "items.variant.*",
        "items.variant.images.*",
        "items.variant.options.*",
        "items.variant.product.*",
        "items.variant.product.images.*",
        "shipping_address.*",
        "billing_address.*"
      ],
      filters: { id: data.id }
    }) as any

    if (!order) {
      console.error(`[OrderPlacedSubscriber] Order not found: ${data.id}`)
      return
    }

    // Calculate total if missing or 0
    const calculatedTotal = order.items?.reduce((acc: number, item: any) => {
      return acc + (Number(item.unit_price) * Number(item.quantity))
    }, 0) || Number(order.total) || 0

    // Ensure summary exists for the template and has numeric total
    if (!order.summary) {
      order.summary = {
        raw_current_order_total: {
          value: Number(calculatedTotal)
        }
      }
    } else {
      order.summary.raw_current_order_total = {
        value: Number(calculatedTotal)
      }
    }

    // Ensure items have correct thumbnail and numeric prices/quantities
    order.items?.forEach((item: any) => {
      item.unit_price = Number(item.unit_price)
      item.quantity = Number(item.quantity)
      
      const variant = item.variant
      const product = variant?.product
      
      if (variant && product) {
        // Try to find color from options or title (using same logic as storefront)
        const colorOption = variant.options?.find((o: any) => 
          ["color", "colour"].some(t => o.option?.title?.toLowerCase().includes(t))
        )
        const colorValue = colorOption?.value || variant.title?.split(" / ").pop()
        
        let imageUrl: string | null = null
        
        if (colorValue) {
          const normalizedColor = colorValue.toLowerCase().replace(/\s+/g, "")
          const escapedColor = colorValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const escapedNormalized = normalizedColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const pattern = new RegExp(`[-_](${escapedColor}|${escapedNormalized})([-_.]|$)`, "i")
          
          const colorMatch = product.images?.find((img: any) => pattern.test(img.url || ""));
          if (colorMatch?.url) imageUrl = colorMatch.url;
        }
        
        // Hardcoded fallbacks for specific products
        if (!imageUrl) {
          if (product.handle === "technical-long-sleeve-rashguard") {
            const isNavy = colorValue?.toLowerCase().includes("navy")
            imageUrl = isNavy 
              ? "https://bucket-production-bd41.up.railway.app/medusa-media/mm-rashguard-navy-01KPA0EFE7M2E7K6C5Z0S8V4C4.webp"
              : "https://bucket-production-bd41.up.railway.app/medusa-media/mm-rashguard-black-01KPA0EEFK50TC99MNDS685YFC.webp"
          } else if (product.handle === "short-sleeve-t-shirt") {
            const isBlue = colorValue?.toLowerCase().includes("blue")
            if (isBlue) imageUrl = "https://bucket-production-bd41.up.railway.app/medusa-media/mm-tshirt-blue-01KPA0GV69A2MGV0K4CC4Z67VQ.webp"
          }
        }
        
        if (imageUrl) {
          item.thumbnail = imageUrl
        } else if (variant.images?.length > 0) {
          item.thumbnail = variant.images[0].url
        } else if (product.thumbnail) {
          item.thumbnail = product.thumbnail
        }
      }
    })

    console.log(`[OrderPlacedSubscriber] Sending notification for order ${order.id} to ${order.email}`)

    const notificationData = {
      emailOptions: {
        replyTo: 'christopherlam@marinersmarkets.com',
        subject: `Order Confirmation for Mariner's Market`,
        cc: 'kkeipohl@gmail.com'
      },
      order,
      shippingAddress: order.shipping_address,
      preview: 'New production order received!'
    }

    console.log(`[OrderPlacedSubscriber] Data for template:`, JSON.stringify(notificationData, (key, value) => 
      key === 'images' || key === 'thumbnail' ? '[IMAGE]' : value
    , 2))

    await notificationModuleService.createNotifications({
      to: order.email,
      channel: 'email',
      template: EmailTemplates.ORDER_PLACED,
      data: notificationData
    })
    
    console.log(`[OrderPlacedSubscriber] Notification created successfully for order ${order.id}`)
  } catch (error) {
    console.error('[OrderPlacedSubscriber] Error processing notification:', error)
  }
}

export const config: SubscriberConfig = {
  event: 'order.placed'
}
