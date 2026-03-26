import Link from 'next/link'

export const metadata = {
  title: 'Terms & Conditions',
  description: 'Terms and conditions for Aura Recall.',
}

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Terms & Conditions</h1>
      <p className="mt-2 text-muted-foreground">Last updated: February 2025</p>

      <div className="prose prose-sm mt-8 dark:prose-invert">
        <p>
          By signing up and using Aura Recall (&quot;the Service&quot;), you agree to these terms.
          We provide appointment reminders and practice management tools. You are responsible for
          securing your account and complying with applicable data protection and healthcare
          regulations in your jurisdiction.
        </p>
        <p>
          We may send appointment and recall messages via WhatsApp and other channels. You must
          ensure you have consent from patients where required. Automated messaging (e.g. reminders,
          recalls) can be paused or disconnected from your dashboard at any time.
        </p>
        <p>
          We may update these terms; we will notify you of material changes. Continued use after
          changes constitutes acceptance.
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
