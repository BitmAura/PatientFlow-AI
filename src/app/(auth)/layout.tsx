import * as React from 'react'
import Link from 'next/link'
import { AuthRightPanel } from '@/components/auth/auth-right-panel'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left – Form */}
      <div className="flex w-full flex-col justify-center px-5 py-10 sm:px-8 lg:w-[45%] lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          {/* Logo */}
          <Link href="/" className="mb-8 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white text-sm font-bold">P</div>
            <span className="text-xl font-bold text-foreground">PatientFlow AI</span>
          </Link>

          {children}

          {/* Trust row */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 border-t pt-6">
            <TrustBadge emoji="🔒" label="256-bit SSL" />
            <TrustBadge emoji="🏥" label="HIPAA Ready" />
            <TrustBadge emoji="🇮🇳" label="India Hosted" />
            <TrustBadge emoji="✅" label="Official WhatsApp API" />
          </div>
        </div>
      </div>

      {/* Right – Branding */}
      <AuthRightPanel />
    </div>
  )
}

function TrustBadge({ emoji, label }: { emoji: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span>{emoji}</span>
      <span>{label}</span>
    </span>
  )
}
