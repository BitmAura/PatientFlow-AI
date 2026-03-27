/**
 * Test utilities for API endpoints
 */

import { NextRequest } from 'next/server'

/**
 * Create a mock NextRequest for testing API routes
 */
export function createMockRequest(
  options: {
    method?: string
    body?: Record<string, unknown>
    headers?: Record<string, string>
    url?: string
  } = {}
): NextRequest {
  const {
    method = 'GET',
    body = {},
    headers = {},
    url = 'http://localhost:3000/api/test',
  } = options

  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  if (method !== 'GET' && Object.keys(body).length > 0) {
    requestInit.body = JSON.stringify(body)
  }

  return new NextRequest(url, requestInit)
}

/**
 * Mock Razorpay API responses
 */
export const mockRazorpayOrder = {
  id: 'order_test_123456',
  entity: 'order',
  amount: 10000,
  amount_paid: 0,
  amount_due: 10000,
  currency: 'INR',
  receipt: 'receipt_test_123',
  status: 'created' as const,
  attempts: 0,
  created_at: Math.floor(Date.now() / 1000),
}

export const mockRazorpayPayment = {
  id: 'pay_test_123456',
  entity: 'payment',
  amount: 10000,
  currency: 'INR',
  status: 'captured' as const,
  method: 'card',
  description: 'Test payment',
  order_id: 'order_test_123456',
  notes: {},
  fee: 354,
  tax: 54,
  skip_notification: 0,
  acquirer_data: {},
  created_at: Math.floor(Date.now() / 1000),
}

/**
 * Generate a valid test signature
 */
export function generateTestSignature(orderId: string, paymentId: string): string {
  const crypto = require('crypto')
  const body = `${orderId}|${paymentId}`
  const secret = process.env.RAZORPAY_KEY_SECRET || 'test_secret'
  return crypto.createHmac('sha256', secret).update(body).digest('hex')
}

/**
 * Mock clinic data
 */
export const mockClinic = {
  id: 'clinic_test_123',
  name: 'Test Clinic',
  slug: 'test-clinic',
  phone: '9876543210',
  email: 'clinic@test.com',
  city: 'Test City',
  state: 'Test State',
}

/**
 * Mock service data
 */
export const mockService = {
  id: 'service_test_123',
  clinic_id: 'clinic_test_123',
  name: 'Test Consultation',
  duration: 30,
  deposit_required: true,
  deposit_amount: 100,
}

/**
 * Mock patient data
 */
export const mockPatientDetails = {
  name: 'John Doe',
  phone: '9876543210',
  email: 'john@example.com',
  notes: 'Test patient',
}
