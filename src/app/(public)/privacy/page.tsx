import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for PatientFlow AI.',
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-muted-foreground">Last updated: February 2025</p>

      <div className="prose prose-sm mt-8 dark:prose-invert">
        <h2>1. Data Collection & Purpose</h2>
        <p>
          PatientFlow AI acts as a Data Processor for healthcare clinics (Data Controllers). We collect strictly necessary operational data: 
          <strong>Patient Identity</strong> (Name, Encrypted Phone Numbers, Encrypted Email), and <strong>Clinical Logistics</strong> (Appointment times, basic service categories, and reminder logs).
          We do not collect or request excessive medical records or deep clinical history metadata.
        </p>
        
        <h2>2. Data Retention & Deletion Rights (Erasure)</h2>
        <p>
          Operational logs (e.g. sent reminders) are automatically purged after 24 months. 
          Upon formal request by a patient or a clinic termination, PatientFlow AI permanently erases all associated patient records, 
          identifiable phone metadata, and clinical associations within <strong>30 operational days</strong>.
        </p>

        <h2>3. Authorized Third-Party Sub-Processors</h2>
        <p>
          To maintain utility, PatientFlow AI routes data strictly through audited vendors:
        </p>
        <ul>
            <li><strong>Supabase (AWS):</strong> Secure PostgreSQL hosting and infrastructural encryption.</li>
            <li><strong>Gupshup:</strong> Approved Meta provider for delivering WhatsApp Business API utility texts.</li>
            <li><strong>Razorpay:</strong> Secure payment gateway that exclusively processes clinic subscription limits (No patient data shared).</li>
        </ul>
        <p>Patient info is NEVER sold to data brokers, ad networks, or external aggregators.</p>

        <h2>4. Data Breach Protocol & DISHA Adherence</h2>
        <p>
          In alignment with Indian healthcare digital standards (DISHA guidelines), if a security breach exposing Protected Health Information (PHI) occurs, 
          we mandate a <strong>72-hour notification SLA</strong> to all affected clinic administrators, empowering them to immediately notify their patients.
        </p>
        
        <p>
          For privacy audits, compliance requests, or automated data extraction workflows, contact your assigned success manager or reach out directly to operations.
        </p>
      </div>

      <p className="mt-8">
        <Link href="/" className="text-primary hover:underline">
          ← Back to home
        </Link>
      </p>
    </div>
  )
}
