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
        <p>
          PatientFlow AI (&quot;we&quot;) collects and processes data necessary to provide appointment
          reminders, recall campaigns, and practice management. This includes clinic and staff
          account data, patient and lead contact information (e.g. name, phone, email), and
          appointment and message logs.
        </p>
        <p>
          We use this data to deliver the Service, send messages via WhatsApp and other channels
          you configure, and improve our product. We do not sell your or your patients&apos; data.
          Data is stored on secure infrastructure (e.g. Supabase) and access is restricted.
        </p>
        <p>
          You are the data controller for your patients&apos; information. You must have a lawful
          basis (e.g. consent, legitimate interest) for sending communications. Patients can opt out
          (e.g. by replying STOP); we honour opt-outs and reflect them in the product.
        </p>
        <p>
          For questions or to request access, correction, or deletion of your data, contact us at
          the details on our website.
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
