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
      
      if (item.variant) {
        // Try to find a color-matched image
        const colorOption = item.variant.options?.find((o: any) => 
          o.option?.title?.toLowerCase().includes("color") || 
          o.option?.title?.toLowerCase().includes("colour") ||
          o.title?.toLowerCase().includes("color") || 
          o.title?.toLowerCase().includes("colour")
        )
        const colorValue = (colorOption?.value || "").toLowerCase()
        
        let bestImage = item.variant.images?.[0]?.url
        
        if (colorValue) {
          // Check variant images first
          const matchedVariantImg = item.variant.images?.find((img: any) => 
            img.url?.toLowerCase().includes(`-${colorValue}`) || 
            img.url?.toLowerCase().includes(`_${colorValue}`)
          )
          if (matchedVariantImg) {
            bestImage = matchedVariantImg.url
          } else {
            // Check product images if variant images didn't match
            const matchedProductImg = item.variant.product?.images?.find((img: any) => 
              img.url?.toLowerCase().includes(`-${colorValue}`) || 
              img.url?.toLowerCase().includes(`_${colorValue}`)
            )
            if (matchedProductImg) bestImage = matchedProductImg.url
          }
        }

        item.thumbnail = bestImage || item.thumbnail || item.variant.product?.thumbnail
      }
    })

    console.log(`[OrderPlacedSubscriber] Sending notification for order ${order.id} to ${order.email}`)

    // 1. Send Customer Email
    const customerNotificationData = {
      emailOptions: {
        replyTo: 'christopherlam@marinersmarkets.com',
        subject: `Order Confirmation for Mariner's Market`,
      },
      order,
      shippingAddress: order.shipping_address,
      preview: 'Your production order has been received!',
      isAdmin: false,
      showProductionDetails: false
    }

    console.log(`[OrderPlacedSubscriber] Sending customer notification to ${order.email}`)
    
    await notificationModuleService.createNotifications({
      to: order.email,
      channel: 'email',
      template: EmailTemplates.ORDER_PLACED,
      data: customerNotificationData
    })

    // 2. Send Admin/Fulfillment Email
    const adminNotificationData = {
      emailOptions: {
        subject: `New Order Received - #${order.display_id}`,
      },
      order,
      shippingAddress: order.shipping_address,
      preview: 'New production order received!',
      isAdmin: true,
      showProductionDetails: true
    }

    console.log(`[OrderPlacedSubscriber] Sending admin notification to kkeipohl@gmail.com`)

    await notificationModuleService.createNotifications({
      to: 'kkeipohl@gmail.com',
      channel: 'email',
      template: EmailTemplates.ORDER_PLACED,
      data: adminNotificationData
    })
    
    console.log(`[OrderPlacedSubscriber] Notification created successfully for order ${order.id}`)
  } catch (error) {
    console.error('[OrderPlacedSubscriber] Error processing notification:', error)
  }
}

export const config: SubscriberConfig = {
  event: 'order.placed'
}
