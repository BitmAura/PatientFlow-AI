import Link from 'next/link'
import type { Metadata } from 'next'
import { MessageCircleMore, ArrowRight } from 'lucide-react'
import { TwentyOneButton } from '@/components/ui/twentyone-button'

export const metadata: Metadata = {
  title: 'Demo Booked | PatientFlow AI',
  description: 'Your PatientFlow AI demo has been booked successfully.',
}

export default function DemoThankYouPage() {
  return (
    <div className="bg-slate-50 py-16 md:py-24">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-lg shadow-emerald-100 sm:p-12">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <MessageCircleMore className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Demo Request Confirmed
          </h1>
          <p className="mt-3 text-base text-slate-600 sm:text-lg">
            Check WhatsApp for confirmation.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            You will also receive reminder messages 24 hours and 1 hour before your demo slot.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/book-demo">
              <TwentyOneButton>
                Book Another Slot
                <ArrowRight className="h-4 w-4" />
              </TwentyOneButton>
            </Link>
            <Link href="/how-it-works" className="text-sm font-semibold text-emerald-700 hover:text-emerald-600">
              See How It Works
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
