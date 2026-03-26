import { DemoBookingForm } from '@/components/public/demo-booking-form'

export const metadata = {
  title: 'Book Demo | PatientFlow AI',
  description: 'Book a free PatientFlow AI demo for your clinic.',
}

export default function BookDemoPage() {
  return (
    <div className="bg-slate-50 py-12 md:py-20">
      <div className="container mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Free clinic demo
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            See How PatientFlow AI Converts More Inquiries
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Share your clinic details and we will contact you on WhatsApp with the next steps.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-slate-700">
            <li>- Instant WhatsApp confirmation</li>
            <li>- Personalized setup walkthrough</li>
            <li>- Optional calendar slot booking</li>
          </ul>
        </div>
        <DemoBookingForm />
      </div>
    </div>
  )
}
