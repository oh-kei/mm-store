import { AbstractPaymentProvider } from "@medusajs/framework/utils"
import { PaymentProviderResponse } from "@medusajs/framework/types"
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
  async initiatePayment(context): Promise<PaymentProviderResponse> {
    const { amount, currency_code, resource_id } = context

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
      const accessToken = authData.token // Adjust if the token is in a different field (e.g., access_token)

      // 2. Create Billing Checkout
      const requestId = crypto.randomUUID()
      
      const checkoutPayload = {
        request_id: requestId,
        mode: "PAYMENT", // Default to one-off payment for store checkout. Change to "SUBSCRIPTION" if needed.
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
        data: {
          status: "pending",
          hosted_url: data.url, // The API response provides a url
          airwallex_checkout_id: data.id
        }
      }
    } catch (error) {
      console.error("[Airwallex] Error creating checkout:", error)
      // Fallback to mock URL for testing if API fails or keys are missing
      const mockHostedUrl = `https://mock.airwallex.com/checkout/${resource_id}?amount=${amount}&currency=${currency_code}`
      return {
        data: {
          status: "pending",
          hosted_url: mockHostedUrl,
          error: error.message
        }
      }
    }
  }

  async authorizePayment(paymentSessionData, context): Promise<PaymentProviderResponse> {
    return { data: paymentSessionData }
  }

  async capturePayment(paymentSessionData): Promise<PaymentProviderResponse> {
    return { data: paymentSessionData }
  }

  async refundPayment(paymentSessionData, refundAmount): Promise<PaymentProviderResponse> {
    return { data: paymentSessionData }
  }

  async deletePayment(paymentSessionData): Promise<void> {
    return
  }

  async retrievePayment(paymentSessionData): Promise<PaymentProviderResponse> {
    return { data: paymentSessionData }
  }
}

export default AirwallexPaymentProviderService
