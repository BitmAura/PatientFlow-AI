/**
 * Payment Service
 * Handles all Razorpay operations for booking deposits
 */

import Razorpay from 'razorpay'
import crypto from 'crypto'
import {
  RazorpayOrder,
  CreateOrderParams,
  RazorpayPayment,
  PaymentVerificationResult,
} from './types'

// Initialize Razorpay with environment variables
function initRazorpay(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)')
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  })
}

/**
 * Create a Razorpay order for booking deposit
 */
export async function createPaymentOrder(params: CreateOrderParams): Promise<RazorpayOrder> {
  try {
    const razorpay = initRazorpay()

    const orderParams = {
      amount: params.amount * 100, // Convert to paise
      currency: 'INR',
      receipt: params.receipt,
      description: params.description || 'Booking Deposit - NoShowKiller',
      notes: params.notes || {},
    }

    const order = (await razorpay.orders.create(orderParams)) as unknown as RazorpayOrder

    return order
  } catch (error) {
    console.error('[Payment Service] Failed to create order:', error)
    throw new Error(`Failed to create payment order: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Fetch order details from Razorpay
 */
export async function getOrderDetails(orderId: string): Promise<RazorpayOrder> {
  try {
    const razorpay = initRazorpay()
    const order = (await razorpay.orders.fetch(orderId)) as unknown as RazorpayOrder
    return order
  } catch (error) {
    console.error('[Payment Service] Failed to fetch order:', error)
    throw new Error(`Failed to fetch order: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Fetch payment details from Razorpay
 */
export async function getPaymentDetails(paymentId: string): Promise<RazorpayPayment> {
  try {
    const razorpay = initRazorpay()
    const payment = (await razorpay.payments.fetch(paymentId)) as unknown as RazorpayPayment
    return payment
  } catch (error) {
    console.error('[Payment Service] Failed to fetch payment:', error)
    throw new Error(`Failed to fetch payment: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Verify payment signature
 * This is crucial for security - ensures payment actually came from Razorpay
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): PaymentVerificationResult {
  try {
    const secret = process.env.RAZORPAY_KEY_SECRET
    if (!secret) {
      throw new Error('RAZORPAY_KEY_SECRET not configured')
    }

    // Create the signature string by concatenating order_id and payment_id
    const body = `${orderId}|${paymentId}`

    // Generate expected signature
    const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex')

    // Compare signatures
    const verified = expectedSignature === signature

    if (!verified) {
      console.warn('[Payment Service] Signature verification failed', {
        orderId,
        paymentId,
        providedSignature: signature,
        expectedSignature,
      })
    }

    return {
      verified,
      order_id: orderId,
      payment_id: paymentId,
      signature,
      amount: 0, // Amount is fetched from payment details separately
    }
  } catch (error) {
    console.error('[Payment Service] Signature verification error:', error)
    throw new Error(`Failed to verify signature: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Capture payment (convert from authorized to captured)
 * Only needed if payment is in authorized state
 */
export async function capturePayment(paymentId: string, amount: number): Promise<RazorpayPayment> {
  try {
    const razorpay = initRazorpay()
    const payment = (await razorpay.payments.capture(paymentId, amount * 100, 'INR')) as unknown as RazorpayPayment
    return payment
  } catch (error) {
    console.error('[Payment Service] Failed to capture payment:', error)
    throw new Error(`Failed to capture payment: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Refund a payment
 */
export async function refundPayment(
  paymentId: string,
  amount?: number
): Promise<{ refund_id: string; status: string }> {
  try {
    const razorpay = initRazorpay()
    const refundParams: Record<string, unknown> = {}

    if (amount) {
      refundParams.amount = amount * 100 // Convert to paise
    }

    const refund = (await razorpay.payments.refund(paymentId, refundParams)) as unknown as {
      refund_id: string
      status: string
    }
    return refund
  } catch (error) {
    console.error('[Payment Service] Failed to refund payment:', error)
    throw new Error(`Failed to refund payment: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Check if payment is successful (captured or authorized)
 */
export function isPaymentSuccessful(payment: RazorpayPayment): boolean {
  return payment.status === 'captured' || payment.status === 'authorized'
}

/**
 * Check if payment failed
 */
export function isPaymentFailed(payment: RazorpayPayment): boolean {
  return payment.status === 'failed'
}
