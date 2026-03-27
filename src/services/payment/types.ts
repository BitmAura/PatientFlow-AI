/**
 * Payment Service Types
 * Handles all Razorpay payment operations
 */

export interface RazorpayOrder {
  id: string
  entity: string
  amount: number
  amount_paid: number
  amount_due: number
  currency: string
  receipt: string
  status: 'created' | 'paid' | 'attempted'
  attempts: number
  created_at: number
}

export interface CreateOrderParams {
  amount: number // in rupees (will be converted to paise)
  receipt: string
  description?: string
  customer_notify?: 0 | 1
  notes?: Record<string, string>
}

export interface RazorpayPayment {
  id: string
  entity: string
  amount: number
  currency: string
  status: 'authorized' | 'failed' | 'captured'
  description?: string
  method: string
  order_id?: string
  invoice_id?: string
  international: boolean
  acquirer_data?: Record<string, unknown>
  vpa?: string
  notes?: Record<string, string>
  fee?: number
  tax?: number
  skip_notification?: number
  error_code?: string
  error_description?: string
  error_source?: string
  error_reason?: string
  error_step?: string
  acquirer_data_raw?: Record<string, unknown>
  created_at: number
}

export interface PaymentWebhookPayload {
  event: string
  payload: {
    payment?: {
      entity: RazorpayPayment
    }
    order?: {
      entity: {
        id: string
        [key: string]: unknown
      }
    }
  }
  created_at: number
}

export interface CreatePaymentOrders {
  order_id: string
  key_id: string
  amount: number
  currency: string
  description: string
  prefill: {
    name?: string
    email?: string
    contact?: string
  }
  notes?: Record<string, string>
}

export interface PaymentVerificationResult {
  verified: boolean
  order_id: string
  payment_id: string
  signature: string
  amount: number
}
