/**
 * POST /api/booking/payment tests
 * Tests for creating real Razorpay orders
 */

import { POST } from '@/app/api/booking/payment/route'
import { createMockRequest, mockService } from '../utils/test-helpers'

// Mock the payment service
jest.mock('@/services/payment', () => ({
  createPaymentOrder: jest.fn().mockResolvedValue({
    id: 'order_test_123456',
    amount: 10000,
    currency: 'INR',
    receipt: expect.any(String),
  }),
}))

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockService,
            error: null,
          }),
        }),
      }),
    }),
  }),
}))

describe('POST /api/booking/payment', () => {
  it('should create a payment order with valid input', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: {
        amount: 100,
        clinic_id: 'clinic_123',
        service_id: 'service_123',
        patient_name: 'John Doe',
        patient_email: 'john@example.com',
        patient_phone: '9876543210',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('order_id')
    expect(data).toHaveProperty('key_id')
    expect(data).toHaveProperty('amount')
    expect(data).toHaveProperty('currency', 'INR')
  })

  it('should reject request without amount', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: {
        clinic_id: 'clinic_123',
        service_id: 'service_123',
        patient_name: 'John Doe',
        patient_email: 'john@example.com',
        patient_phone: '9876543210',
      },
    })

    const response = await POST(request)
    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data).toHaveProperty('error')
    expect(data.error).toContain('Invalid')
  })

  it('should reject negative amounts', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: {
        amount: -100,
        clinic_id: 'clinic_123',
        service_id: 'service_123',
        patient_name: 'John Doe',
        patient_email: 'john@example.com',
        patient_phone: '9876543210',
      },
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('should reject invalid email', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: {
        amount: 100,
        clinic_id: 'clinic_123',
        service_id: 'service_123',
        patient_name: 'John Doe',
        patient_email: 'not-an-email',
        patient_phone: '9876543210',
      },
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('should include patient details in prefill', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: {
        amount: 100,
        clinic_id: 'clinic_123',
        service_id: 'service_123',
        patient_name: 'John Doe',
        patient_email: 'john@example.com',
        patient_phone: '9876543210',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(data.prefill).toEqual({
      name: 'John Doe',
      email: 'john@example.com',
      contact: '9876543210',
    })
  })
})
