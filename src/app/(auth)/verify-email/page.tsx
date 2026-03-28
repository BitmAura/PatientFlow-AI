import Link from 'next/link'
import { Mail } from 'lucide-react'

export default function VerifyEmailPage() {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
        <Mail className="h-7 w-7" aria-hidden />
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Check your email
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a confirmation link to your inbox. Open it to verify your account, then sign
          in to open your PatientFlow AI workspace.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Link
          href="/login"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90"
        >
          Go to sign in
        </Link>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-6 text-sm font-medium text-foreground hover:bg-muted"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
