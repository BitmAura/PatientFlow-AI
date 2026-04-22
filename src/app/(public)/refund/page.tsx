import Link from 'next/link'
import { RefreshCcw } from 'lucide-react'

export const metadata = {
  title: 'Cancellation & Refund Policy',
  description: 'Cancellation, subscription, and refund policies for PatientFlow AI.',
}

export default function RefundPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-center gap-3">
        <RefreshCcw className="h-8 w-8 text-emerald-600" />
        <h1 className="text-3xl font-bold tracking-tight">Cancellation & Refund Policy</h1>
      </div>
      <p className="mt-2 text-muted-foreground">Last updated: April 2026</p>

      <div className="prose prose-sm mt-8 dark:prose-invert">
        <h2>14-Day Free Trial</h2>
        <p>
          Every new clinic account begins with a <strong>14-day free trial</strong> with full access to the platform, 
          including WhatsApp integration and appointment limits. You will not be charged if you cancel before the trial ends.
        </p>

        <h2>Cancellation & No Lock-In</h2>
        <p>
          You may cancel your subscription at any time directly from the billing section of your dashboard. 
          We operate on a strict <strong>no lock-in contract</strong> basis. Upon cancellation, your account will remain active 
          until the end of your current billing cycle. 
        </p>
        <p>
          Once the billing cycle concludes, all automated communications will cease. You have <strong>7 days</strong> to export 
          your patient data before we initiate our permanent data erasure process aligned with our BAA commitments.
        </p>

        <h2>Refunds</h2>
        <p>
          Because of the high infrastructure costs associated with maintaining active WhatsApp APIs and live database partitions, 
          we do not offer pro-rata refunds for partial months used. If you cancel your subscription midway through the month, 
          you will not receive a refund for the remaining days.
        </p>
        <p>
          In the event of accidental billing or technical failure leading to double charges, please contact our support team 
          within 72 hours for an immediate full correction and refund to the original payment method.
        </p>

        <h2>Chargebacks & Disputes</h2>
        <p>
          Before initiating a chargeback through Razorpay or your card issuer, we request that you contact us first at 
          support@patientflow.ai to resolve the issue amicably.
        </p>
      </div>

      <p className="mt-8">
        <Link href="/" className="text-primary hover:underline font-semibold">
          ← Back to home
        </Link>
      </p>
    </div>
  )
}
