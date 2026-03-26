import { NextResponse } from 'next/server'
// import Razorpay from 'razorpay'

export async function POST(request: Request) {
  // Mock Razorpay Order Creation
  const { amount } = await request.json()

  // In production:
  // const razorpay = new Razorpay({ key_id: '...', key_secret: '...' })
  // const order = await razorpay.orders.create({ amount: amount * 100, currency: 'INR' })
  
  const mockOrder = {
    id: 'order_' + Math.random().toString(36).substring(7),
    amount: amount * 100,
    currency: 'INR',
    key_id: 'rzp_test_mock_key'
  }

  return NextResponse.json(mockOrder)
}
