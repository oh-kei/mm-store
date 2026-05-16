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
  showProductionDetails?: boolean
  isAdmin?: boolean
}

const getAbsoluteUrl = (url?: string) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const baseUrl = process.env.STORE_CORS?.split(',')[0] || "http://localhost:8000"
  return `${baseUrl}${url}`
}

export const isOrderPlacedTemplateData = (data: any): data is OrderPlacedTemplateProps =>
  typeof data.order === 'object' && typeof data.shippingAddress === 'object'

export const OrderPlacedTemplate: React.FC<OrderPlacedTemplateProps> & {
  PreviewProps: OrderPlacedPreviewProps
} = ({ order, shippingAddress, preview = 'Your order has been placed!', showProductionDetails = true, isAdmin = false }) => {
  return (
    <Base preview={preview}>
      <Section>
        <Text style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', margin: '0 0 10px', color: '#0F172A' }}>
          {isAdmin ? 'New Order Received' : 'Order Confirmation'}
        </Text>
        <Text style={{ fontSize: '14px', textAlign: 'center', margin: '0 0 30px', color: '#D4AF37', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>
          Mariner's Market
        </Text>

        {!isAdmin && (
          <Text style={{ margin: '0 0 15px', color: '#334155' }}>
            Dear {shippingAddress.first_name} {shippingAddress.last_name},
          </Text>
        )}

        <Text style={{ margin: '0 0 30px', color: '#64748b', fontSize: '14px' }}>
          {isAdmin 
            ? 'A new order has been placed, find the summary of the items purchased below.'
            : 'We have received your order. Our team will review your submitted designs and requirements shortly. Please find the summary of your purchases below:'}
        </Text>

        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
          <Text style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 15px', color: '#0F172A' }}>
            Order Summary
          </Text>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <tr>
              <td style={{ padding: '4px 0', fontSize: '12px', color: '#64748b' }}>Order ID</td>
              <td style={{ padding: '4px 0', fontSize: '12px', fontWeight: 'bold', textAlign: 'right' }}>#{order.display_id}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', fontSize: '12px', color: '#64748b' }}>Date</td>
              <td style={{ padding: '4px 0', fontSize: '12px', fontWeight: 'bold', textAlign: 'right' }}>{new Date(order.created_at).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style={{ padding: '12px 0 0', fontSize: '14px', fontWeight: 'bold', color: '#0F172A', borderTop: '1px solid #e2e8f0' }}>Total</td>
              <td style={{ padding: '12px 0 0', fontSize: '14px', fontWeight: 'bold', color: '#0F172A', textAlign: 'right', borderTop: '1px solid #e2e8f0' }}>
                {Number(order.summary?.raw_current_order_total?.value || 0)} {order.currency_code?.toUpperCase()}
              </td>
            </tr>
          </table>
          
          <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px dashed #e2e8f0' }}>
            <Text style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>Items Purchased</Text>
            {order.items.map((item: any, i) => {
              const isCustom = !!item.metadata?.recipe
              return (
                <div key={i} style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <Text style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#0F172A' }}>
                      {Number(item.quantity)}x {String(item.product_title || item.title)}
                    </Text>
                    {isCustom && (
                      <span style={{ fontSize: '9px', backgroundColor: '#D4AF37', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}>Custom</span>
                    )}
                  </div>
                  {item.variant?.title && (
                    <Text style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>
                      {item.variant.title}
                    </Text>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Support contact footer */}
        {!isAdmin && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Text style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              Have questions? Contact our team at <a href="mailto:support@marinersmarkets.com" style={{ color: '#D4AF37', textDecoration: 'none' }}>support@marinersmarkets.com</a>
            </Text>
          </div>
        )}

        <Hr style={{ margin: '30px 0', borderColor: '#f1f5f9' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div>
            <Text style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 10px', color: '#0F172A' }}>
              Shipping Address
            </Text>
            <Text style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.6' }}>
              {shippingAddress.first_name} {shippingAddress.last_name}<br />
              {shippingAddress.address_1}<br />
              {shippingAddress.city}, {shippingAddress.province} {shippingAddress.postal_code}<br />
              {shippingAddress.country_code.toUpperCase()}
            </Text>
          </div>
        </div>

        <Hr style={{ margin: '30px 0', borderColor: '#f1f5f9' }} />

        <Text style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 20px', color: '#0F172A' }}>
          Detailed Item Breakdown
        </Text>

        <div style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #ddd',
          margin: '10px 0'
        }}>
          {order.items.map((item: any) => {
            const recipe = item.metadata?.recipe
            const crewMember = item.metadata?.crew_member

            return (
              <div key={item.id} style={{
                padding: '12px 8px',
                borderBottom: '1px solid #ddd'
              }}>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'flex-start' }}>
                  {(item.thumbnail || item.variant?.thumbnail || item.variant?.images?.[0]?.url) && (
                    <img src={getAbsoluteUrl(item.variant?.images?.[0]?.url || item.thumbnail || item.variant?.thumbnail)} alt={item.title} style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #eee' }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <Text style={{ fontWeight: 'bold', margin: '0 0 4px', fontSize: '14px', color: '#0F172A' }}>
                      {item.product_title || item.title}
                    </Text>
                    {item.variant?.title && (
                      <Text style={{ margin: '0 0 4px', fontSize: '12px', color: '#64748b', fontWeight: 'medium' }}>
                        {item.variant.title}
                      </Text>
                    )}
                    {crewMember && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0' }}>
                        <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#D4AF37', textTransform: 'uppercase' }}>For: {String(crewMember)}</span>
                      </div>
                    )}
                    <Text style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>
                      {Number(item.quantity)} x {Number(item.unit_price)} {order.currency_code?.toUpperCase()}
                    </Text>
                  </div>
                </div>
                
                {/* Design Previews */}
                {(item as any).metadata?.previews ? (
                  <div style={{ margin: '15px 0' }}>
                    <Text style={{ fontSize: '10px', fontWeight: 'bold', color: '#D4AF37', textTransform: 'uppercase', margin: '0 0 10px' }}>
                      Design Previews (All Views)
                    </Text>
                    <table style={{ width: '100%' }}>
                      <tr>
                        {Object.entries((item as any).metadata.previews as Record<string, string>).map(([view, url], idx) => (
                          <td key={view} style={{ width: '50%', padding: '5px' }}>
                            <img 
                              src={getAbsoluteUrl(url)} 
                              alt={`${view} view`} 
                              style={{ width: '100%', borderRadius: '8px', border: '1px solid #ddd' }} 
                            />
                            <div style={{ fontSize: '8px', textAlign: 'center', color: '#999', marginTop: '4px', textTransform: 'uppercase' }}>{view}</div>
                          </td>
                        ))}
                      </tr>
                    </table>
                  </div>
                ) : (item as any).metadata?.preview_url ? (
                  <div style={{ margin: '15px 0' }}>
                    <Text style={{ fontSize: '10px', fontWeight: 'bold', color: '#D4AF37', textTransform: 'uppercase', margin: '0 0 10px' }}>
                      Design Preview
                    </Text>
                    <img 
                      src={getAbsoluteUrl((item as any).metadata.preview_url)} 
                      alt="Design Preview" 
                      style={{ width: '100%', maxWidth: '300px', borderRadius: '12px', border: '1px solid #ddd' }} 
                    />
                  </div>
                ) : null}

                {/* Product Views for customized items (fallback if previews missing) */}
                {recipe && item.variant?.product?.images && (
                   <div style={{ margin: '15px 0' }}>
                    <Text style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', margin: '0 0 10px' }}>
                      Product Views
                    </Text>
                    <table style={{ width: '100%' }}>
                      <tr>
                        {item.variant.product.images
                          .filter((img: any) => {
                            const url = img.url?.toLowerCase() || ""
                            return url.includes("-back") || url.includes("-side") || (!url.includes("-back") && !url.includes("-side") && !url.includes("-blank"))
                          })
                          .slice(0, 4)
                          .map((img: any, idx: number) => (
                          <td key={idx} style={{ width: '50%', padding: '5px' }}>
                            <img 
                              src={getAbsoluteUrl(img.url)} 
                              alt={`View ${idx + 1}`} 
                              style={{ width: '100%', borderRadius: '8px', border: '1px solid #eee' }} 
                            />
                          </td>
                        ))}
                      </tr>
                    </table>
                  </div>
                )}
                
                {/* Custom Design Details for Staff */}
                {showProductionDetails && (recipe || item.metadata?.comment) && (
                  <div style={{ 
                    backgroundColor: '#f9f9f9', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    marginTop: '8px',
                    border: '1px solid #eee'
                  }}>
                    <Text style={{ fontSize: '10px', fontWeight: 'bold', color: '#888', textTransform: 'uppercase', margin: '0 0 8px' }}>
                      Production Details
                    </Text>
                    
                    {item.metadata?.comment && (
                      <div style={{ marginBottom: '12px', padding: '10px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', borderLeft: '3px solid #D4AF37' }}>
                        <Text style={{ fontSize: '10px', fontWeight: 'bold', margin: '0 0 4px', color: '#0F172A' }}>CUSTOMER COMMENT:</Text>
                        <Text style={{ fontSize: '12px', margin: 0, fontStyle: 'italic', color: '#334155' }}>"{item.metadata.comment}"</Text>
                      </div>
                    )}

                    {recipe?.layers?.map((layer: any, idx: number) => (
                      <div key={idx} style={{ marginBottom: '8px' }}>
                        <Text style={{ fontSize: '11px', fontWeight: 'bold', margin: '0 0 2px' }}>
                          {layer.type === 'text' ? 'TEXT LAYER' : 'LOGO LAYER'} 
                          <span style={{ color: '#D4AF37', marginLeft: '4px' }}>({(layer.view || 'front').toUpperCase()})</span>
                        </Text>
                        <Text style={{ fontSize: '11px', margin: 0 }}>
                          {layer.type === 'text' 
                            ? `Content: "${layer.props.text}" | Font: ${layer.props.fontFamily} | Color: ${layer.props.fill}` 
                            : `Asset Link: ${layer.props.url}`}
                        </Text>
                        {layer.type === 'image' && (
                          <div style={{ marginTop: '5px' }}>
                             <a href={encodeURI(layer.props.url)} style={{ fontSize: '10px', color: '#2563EB', textDecoration: 'underline' }}>
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
