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
        "*",
        "items.*",
        "items.variant.*",
        "shipping_address.*",
        "billing_address.*"
      ],
      filters: { id: data.id }
    }) as any

    if (!order) {
      console.error(`[OrderPlacedSubscriber] Order not found: ${data.id}`)
      return
    }

    // Ensure summary exists for the template
    if (!order.summary) {
      order.summary = {
        raw_current_order_total: {
          value: order.total || 0
        }
      }
    }

    console.log(`[OrderPlacedSubscriber] Sending notification for order ${order.id} to ${order.email}`)

    await notificationModuleService.createNotifications({
      to: order.email,
      channel: 'email',
      template: EmailTemplates.ORDER_PLACED,
      data: {
        emailOptions: {
          replyTo: 'christopherlam@marinersmarkets.com',
          subject: `Order Confirmation for Mariner's Market`,
          cc: 'kkeipohl@gmail.com'
        },
        order,
        shippingAddress: order.shipping_address,
        preview: 'New production order received!'
      }
    })
    
    console.log(`[OrderPlacedSubscriber] Notification created successfully for order ${order.id}`)
  } catch (error) {
    console.error('[OrderPlacedSubscriber] Error processing notification:', error)
  }
}

export const config: SubscriberConfig = {
  event: 'order.placed'
}
