import { Text, Section, Hr } from '@react-email/components'
import * as React from 'react'
import { Base } from './base'
import { OrderDTO, OrderAddressDTO } from '@medusajs/framework/types'

export const ORDER_PLACED = 'order-placed'

interface OrderPlacedPreviewProps {
  order: OrderDTO & { display_id: string; summary: { raw_current_order_total: { value: number } } }
  shippingAddress: OrderAddressDTO
}

export interface OrderPlacedTemplateProps {
  order: OrderDTO & { display_id: string; summary: { raw_current_order_total: { value: number } } }
  shippingAddress: OrderAddressDTO
  preview?: string
}

export const isOrderPlacedTemplateData = (data: any): data is OrderPlacedTemplateProps =>
  typeof data.order === 'object' && typeof data.shippingAddress === 'object'

export const OrderPlacedTemplate: React.FC<OrderPlacedTemplateProps> & {
  PreviewProps: OrderPlacedPreviewProps
} = ({ order, shippingAddress, preview = 'Your order has been placed!' }) => {
  return (
    <Base preview={preview}>
      <Section>
        <Text style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', margin: '0 0 30px' }}>
          Order Confirmation
        </Text>

        <Text style={{ margin: '0 0 15px' }}>
          Dear {shippingAddress.first_name} {shippingAddress.last_name},
        </Text>

        <Text style={{ margin: '0 0 30px' }}>
          Thank you for your recent order! Here are your order details:
        </Text>

        <Text style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px' }}>
          Order Summary
        </Text>
        <Text style={{ margin: '0 0 5px' }}>
          Order ID: {order.display_id}
        </Text>
        <Text style={{ margin: '0 0 5px' }}>
          Order Date: {new Date(order.created_at).toLocaleDateString()}
        </Text>
        <Text style={{ margin: '0 0 20px' }}>
          Total: {order.summary.raw_current_order_total.value} {order.currency_code}
        </Text>

        <Hr style={{ margin: '20px 0' }} />

        <Text style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px' }}>
          Shipping Address
        </Text>
        <Text style={{ margin: '0 0 5px' }}>
          {shippingAddress.address_1}
        </Text>
        <Text style={{ margin: '0 0 5px' }}>
          {shippingAddress.city}, {shippingAddress.province} {shippingAddress.postal_code}
        </Text>
        <Text style={{ margin: '0 0 20px' }}>
          {shippingAddress.country_code}
        </Text>

        <Hr style={{ margin: '20px 0' }} />

        <Text style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px' }}>
          Order Items
        </Text>

        <div style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #ddd',
          margin: '10px 0'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            backgroundColor: '#f2f2f2',
            padding: '8px',
            borderBottom: '1px solid #ddd'
          }}>
            <Text style={{ fontWeight: 'bold' }}>Item</Text>
            <Text style={{ fontWeight: 'bold' }}>Quantity</Text>
            <Text style={{ fontWeight: 'bold' }}>Price</Text>
          </div>
          {order.items.map((item) => {
            const recipe = (item as any).metadata?.recipe
            const crewMember = (item as any).metadata?.crew_member

            return (
              <div key={item.id} style={{
                padding: '12px 8px',
                borderBottom: '1px solid #ddd'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <Text style={{ fontWeight: 'bold', margin: 0 }}>{item.title} - {item.product_title}</Text>
                  <Text style={{ margin: 0 }}>{item.quantity} x {item.unit_price} {order.currency_code}</Text>
                </div>
                
                {/* Custom Design Details for Staff */}
                {recipe && (
                  <div style={{ 
                    backgroundColor: '#f9f9f9', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    marginTop: '8px',
                    border: '1px solid #eee'
                  }}>
                    <Text style={{ fontSize: '10px', fontWeight: 'bold', color: '#888', textTransform: 'uppercase', margin: '0 0 8px' }}>
                      Production Details {crewMember ? `(For Member: ${crewMember})` : ''}
                    </Text>
                    {recipe.layers?.map((layer: any, idx: number) => (
                      <div key={idx} style={{ marginBottom: '8px' }}>
                        <Text style={{ fontSize: '11px', fontWeight: 'bold', margin: '0 0 2px' }}>
                          {layer.type === 'text' ? 'TEXT LAYER' : 'LOGO LAYER'}
                        </Text>
                        <Text style={{ fontSize: '11px', margin: 0 }}>
                          {layer.type === 'text' 
                            ? `Content: "${layer.props.text}" | Font: ${layer.props.fontFamily} | Color: ${layer.props.fill}` 
                            : `Asset Link: ${layer.props.url}`}
                        </Text>
                        {layer.type === 'image' && (
                          <div style={{ marginTop: '5px' }}>
                             <a href={layer.props.url} style={{ fontSize: '10px', color: '#2563EB', textDecoration: 'underline' }}>
                               Download High-Res Logo
                             </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        <Text style={{ fontSize: '12px', color: '#666', marginTop: '40px', textAlign: 'center' }}>
          Production team: Please use the links above to download original assets.
        </Text>
      </Section>
    </Base>
  )
}

OrderPlacedTemplate.PreviewProps = {
  order: {
    id: 'test-order-id',
    display_id: 'ORD-123',
    created_at: new Date().toISOString(),
    email: 'test@example.com',
    currency_code: 'USD',
    items: [
      { id: 'item-1', title: 'Item 1', product_title: 'Product 1', quantity: 2, unit_price: 10 },
      { id: 'item-2', title: 'Item 2', product_title: 'Product 2', quantity: 1, unit_price: 25 }
    ],
    shipping_address: {
      first_name: 'Test',
      last_name: 'User',
      address_1: '123 Main St',
      city: 'Anytown',
      province: 'CA',
      postal_code: '12345',
      country_code: 'US'
    },
    summary: { raw_current_order_total: { value: 45 } }
  },
  shippingAddress: {
    first_name: 'Test',
    last_name: 'User',
    address_1: '123 Main St',
    city: 'Anytown',
    province: 'CA',
    postal_code: '12345',
    country_code: 'US'
  }
} as OrderPlacedPreviewProps

export default OrderPlacedTemplate
