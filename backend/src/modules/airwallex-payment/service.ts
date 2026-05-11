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

      // 2. Create Payment Intent
      const requestId = crypto.randomUUID()
      
      // User requested to keep amounts in HKD (not cents) in Medusa.
      const majorAmount = amount

      const paymentIntentPayload = {
        amount: majorAmount,
        currency: currency_code.toUpperCase(),
        merchant_order_id: resource_id,
        request_id: requestId,
        descriptor: "Mariners Market Order"
      }

      console.log(`[Airwallex] Creating PaymentIntent for amount ${majorAmount}`)

      const response = await fetch('https://api-demo.airwallex.com/api/v1/pa/payment_intents/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(paymentIntentPayload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Airwallex PaymentIntent creation failed: ${JSON.stringify(errorData)}`)
      }

      const data = await response.json()

      return {
        id: data.id,
        data: {
          ...data,
          status: "pending",
          client_secret: data.client_secret, // Store client_secret for frontend
        }
      }
    } catch (error) {
      console.error("[Airwallex] Error creating PaymentIntent:", error)
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

  // Detailed logging to find the email and see what's happening
  async createAccountHolder(input: any): Promise<any> {
    const { context } = input
    const customer = context?.customer

    const email = customer?.email

    console.log(`[Airwallex] Customer email: ${email}`)

    if (!email) {
      throw new Error("Missing customer email.")
    }

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

    // 2. Create customer in Airwallex
    const response = await fetch('https://api-demo.airwallex.com/api/v1/pa/customers/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        request_id: crypto.randomUUID(),
        merchant_customer_id: customer.id,
        email: email
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error(`[Airwallex] Customer creation failed:`, errorData)
      throw new Error(`Airwallex Customer creation failed: ${JSON.stringify(errorData)}`)
    }

    const providerCustomer = await response.json()
    console.log(`[Airwallex] Airwallex customer created:`, providerCustomer)

    return {
      id: providerCustomer.id,
      data: providerCustomer as unknown as Record<string, unknown>
    }
  }
}

export default AirwallexPaymentProviderService
