import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

export const metadata = {
  title: 'Business Associate Agreement (BAA)',
  description: 'Legal agreement covering the protection of PHI by PatientFlow AI.',
}

export default function BaaPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-8 w-8 text-emerald-600" />
        <h1 className="text-3xl font-bold tracking-tight">Business Associate Agreement (BAA)</h1>
      </div>
      <p className="mt-2 text-muted-foreground">Last updated: April 2026</p>

      <div className="prose prose-sm mt-8 dark:prose-invert">
        <p>
          This Business Associate Agreement (&quot;BAA&quot;) outlines the legal responsibilities of PatientFlow AI 
          (the &quot;Business Associate&quot;) when handling Protected Health Information (PHI) on behalf of 
          healthcare clinics (the &quot;Covered Entity&quot;).
        </p>

        <h2>1. Permitted Uses and Disclosures</h2>
        <p>
          We will only use or disclose PHI as necessary to perform the services defined in the primary Subscription Agreement. 
          This is strictly limited to:
        </p>
        <ul>
          <li>Delivering WhatsApp appointment reminders and recall notifications.</li>
          <li>Providing analytics related to clinical attendance rates.</li>
        </ul>
        <p><strong>We will never sell your patient data to third parties.</strong></p>

        <h2>2. Safeguards and Encryption</h2>
        <p>
          We implement administrative, physical, and technical safeguards that reasonably and appropriately protect the 
          confidentiality, integrity, and availability of the electronic PHI that we create, receive, maintain, or transmit. 
          Patient metadata (such as phone numbers) is encrypted at rest using PostgreSQL cryptographic standards.
        </p>

        <h2>3. Breach Notification</h2>
        <p>
          In the event of a security incident resulting in the unauthorized disclosure of PHI, we will notify the Covered Entity 
          without unreasonable delay, and in no case later than <strong>72 hours</strong> after the discovery of the breach. 
          We accept liability within the bounds of this platform for breaches caused by our direct negligence.
        </p>

        <h2>4. Data Deletion and Return</h2>
        <p>
          Upon cancellation or termination of your subscription, we will permanently destroy all PHI maintained in any form 
          within 30 days unless retention is required by law. Data export requests must be completed within 7 days of cancellation.
        </p>

        <h2>5. Clinic Responsibilities</h2>
        <p>
          The Covered Entity is solely responsible for ensuring they have the legal right (e.g., patient consent or legitimate interest) 
          to upload patient contact details into the platform and trigger automated messaging.
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
