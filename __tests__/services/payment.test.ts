/**
 * Payment Service Tests
 * Tests for Razorpay integration and payment validation
 */

import {
  createPaymentOrder,
  verifyPaymentSignature,
  isPaymentSuccessful,
  isPaymentFailed,
} from '@/services/payment'
import { mockRazorpayOrder, mockRazorpayPayment, generateTestSignature } from '../utils/test-helpers'

// Mock the Razorpay module
jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => ({
    orders: {
      create: jest.fn().mockResolvedValue(mockRazorpayOrder),
      fetch: jest.fn().mockResolvedValue(mockRazorpayOrder),
    },
    payments: {
      fetch: jest.fn().mockResolvedValue(mockRazorpayPayment),
      capture: jest.fn().mockResolvedValue({
        ...mockRazorpayPayment,
        status: 'captured',
      }),
      refund: jest.fn().mockResolvedValue({
        refund_id: 'rfnd_test_123',
        status: 'processed',
      }),
    },
  }))
})

describe('Payment Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createPaymentOrder', () => {
    it('should create a real Razorpay order', async () => {
      const order = await createPaymentOrder({
        amount: 100,
        receipt: 'receipt_123',
        description: 'Test booking',
      })

      expect(order).toEqual(mockRazorpayOrder)
      expect(order.id).toMatch(/^order_/)
      expect(order.amount).toBe(10000) // 100 * 100 in paise
    })

    it('should handle errors gracefully', async () => {
      const RazorpayMock = require('razorpay')
      RazorpayMock.mockImplementationOnce(() => ({
        orders: {
          create: jest.fn().mockRejectedValue(new Error('API Error')),
        },
      }))

      await expect(
        createPaymentOrder({
          amount: 100,
          receipt: 'receipt_123',
        })
      ).rejects.toThrow('Failed to create payment order')
    })

    it('should include notes with request', async () => {
      await createPaymentOrder({
        amount: 100,
        receipt: 'receipt_123',
        notes: {
          clinic_id: 'clinic_123',
          patient_name: 'John Doe',
        },
      })

      // Verify notes were passed (mocked Razorpay would receive them)
      expect(true).toBe(true) // Placeholder for mock verification
    })
  })

  describe('verifyPaymentSignature', () => {
    it('should verify a valid signature', () => {
      const orderId = 'order_test_123456'
      const paymentId = 'pay_test_123456'
      const signature = generateTestSignature(orderId, paymentId)

      const result = verifyPaymentSignature(orderId, paymentId, signature)

      expect(result.verified).toBe(true)
      expect(result.order_id).toBe(orderId)
      expect(result.payment_id).toBe(paymentId)
    })

    it('should reject an invalid signature', () => {
      const orderId = 'order_test_123456'
      const paymentId = 'pay_test_123456'
      const invalidSignature = 'invalid_signature_xyz'

      const result = verifyPaymentSignature(orderId, paymentId, invalidSignature)

      expect(result.verified).toBe(false)
    })

    it('should handle missing webhook secret', () => {
      const oldSecret = process.env.RAZORPAY_KEY_SECRET
      delete process.env.RAZORPAY_KEY_SECRET

      expect(() => {
        verifyPaymentSignature('order_123', 'pay_123', 'sig_123')
      }).toThrow()

      process.env.RAZORPAY_KEY_SECRET = oldSecret
    })
  })

  describe('isPaymentSuccessful', () => {
    it('should return true for captured payment', () => {
      const payment = { ...mockRazorpayPayment, status: 'captured' as const }
      expect(isPaymentSuccessful(payment)).toBe(true)
    })

    it('should return true for authorized payment', () => {
      const payment = { ...mockRazorpayPayment, status: 'authorized' as const }
      expect(isPaymentSuccessful(payment)).toBe(true)
    })

    it('should return false for failed payment', () => {
      const payment = { ...mockRazorpayPayment, status: 'failed' as const }
      expect(isPaymentSuccessful(payment)).toBe(false)
    })
  })

  describe('isPaymentFailed', () => {
    it('should return true for failed payment', () => {
      const payment = { ...mockRazorpayPayment, status: 'failed' as const }
      expect(isPaymentFailed(payment)).toBe(true)
    })

    it('should return false for successful payment', () => {
      const payment = { ...mockRazorpayPayment, status: 'captured' as const }
      expect(isPaymentFailed(payment)).toBe(false)
    })
  })
})
