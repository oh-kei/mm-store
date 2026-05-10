import { AbstractPaymentProvider } from "@medusajs/framework/utils"
import crypto from "crypto"

class AirwallexPaymentProviderService extends AbstractPaymentProvider {
  static identifier = "airwallex"

  protected options_: any

  constructor(container, options) {
    super(container, options)
    this.options_ = options
  }

  /**
   * Initiate a payment session.
   * This is called when the user selects Airwallex at checkout.
   */
  async initiatePayment(input: any): Promise<any> {
    const { amount, currency_code, context } = input
    const resource_id = context?.id || `order_${crypto.randomUUID().slice(0, 8)}`

    console.log(`[Airwallex] Initiating payment for order ${resource_id} with amount ${amount} ${currency_code}`)

    try {
      // 1. Get Access Token
      const authResponse = await fetch('https://api-demo.airwallex.com/api/v1/authentication/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': this.options_.clientId,
          'x-api-key': this.options_.apiKey
        }
      })

      if (!authResponse.ok) {
        throw new Error(`Airwallex authentication failed: ${authResponse.statusText}`)
      }

      const authData = await authResponse.json()
      const accessToken = authData.token

      // 2. Create Billing Checkout
      const requestId = crypto.randomUUID()
      
      const checkoutPayload = {
        request_id: requestId,
        mode: "PAYMENT",
        success_url: `${process.env.STORE_URL || 'http://localhost:8000'}/order-confirmed`,
        cancel_url: `${process.env.STORE_URL || 'http://localhost:8000'}/checkout`,
        payment_settings: {
          payment_method_types: ["card", "googlepay", "applepay"]
        },
        metadata: {
          internal_order_id: resource_id
        }
      }

      const response = await fetch('https://api-demo.airwallex.com/api/v1/billing/checkouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(checkoutPayload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Airwallex checkout creation failed: ${JSON.stringify(errorData)}`)
      }

      const data = await response.json()

      return {
        id: data.id,
        data: {
          ...data,
          status: "pending",
          hosted_url: data.url,
        }
      }
    } catch (error) {
      console.error("[Airwallex] Error creating checkout:", error)
      // Throw the error so it fails hard and appears in Railway logs!
      throw error
    }
  }

  async authorizePayment(input: any): Promise<any> {
    console.log(`[Airwallex] Authorizing payment for session ${input.data?.id}`)
    return {
      data: input.data,
      status: "authorized",
    }
  }

  async capturePayment(input: any): Promise<any> {
    console.log(`[Airwallex] Capturing payment for ${input.data?.id}`)
    return {
      data: {
        ...input.data,
        id: input.data?.id,
      },
    }
  }

  async refundPayment(input: any): Promise<any> {
    console.log(`[Airwallex] Refunding payment for ${input.data?.id}`)
    return {
      data: input.data,
    }
  }

  async cancelPayment(input: any): Promise<any> {
    console.log(`[Airwallex] Canceling payment for ${input.data?.id}`)
    return { data: input.data }
  }

  async retrievePayment(input: any): Promise<any> {
    console.log(`[Airwallex] Retrieving payment for ${input.data?.id}`)
    return input.data
  }

  async deletePayment(input: any): Promise<any> {
    console.log(`[Airwallex] Deleting payment for ${input.data?.id}`)
    return {
      data: input.data,
    }
  }

  async getPaymentStatus(input: any): Promise<any> {
    return { status: "authorized" }
  }

  async updatePayment(input: any): Promise<any> {
    return { data: input.data }
  }

  async getWebhookActionAndData(payload: any): Promise<any> {
    return { action: "captured", data: {} }
  }
}

export default AirwallexPaymentProviderService
