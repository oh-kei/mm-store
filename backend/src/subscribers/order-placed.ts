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
    const order = await orderModuleService.retrieveOrder(data.id, { 
      relations: ['items', 'items.variant', 'summary', 'shipping_address', 'billing_address'] 
    })

    if (!order) {
      console.error(`[OrderPlacedSubscriber] Order not found: ${data.id}`)
      return
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
