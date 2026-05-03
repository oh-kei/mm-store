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
        "items.variant.product.*",
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
      
      if (!item.thumbnail && item.variant?.product?.thumbnail) {
        item.thumbnail = item.variant.product.thumbnail
      }
      if (item.variant?.images?.length > 0) {
        // Use variant specific image if available
        item.thumbnail = item.variant.images[0].url
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
