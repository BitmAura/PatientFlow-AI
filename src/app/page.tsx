import Link from 'next/link'
import { DemoBookingForm } from '@/components/public/demo-booking-form'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:py-24">
        <div>
          <p className="inline-flex rounded-full bg-emerald-100 px-4 py-1 text-sm font-semibold text-emerald-800">
            PatientFlow AI
          </p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">
            Turn Missed Inquiries into Booked Patients Automatically
          </h1>
          <p className="mt-4 text-lg text-zinc-600">
            PatientFlow AI uses WhatsApp automation to follow up, confirm, and convert patients without extra staff.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/book-demo"
              className="rounded-lg bg-emerald-600 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-700"
            >
              Book Free Demo
            </Link>
            <Link
              href="/demo"
              className="rounded-lg border border-zinc-300 px-6 py-3 text-base font-semibold text-zinc-700 hover:bg-zinc-100"
            >
              Try Live Demo
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-zinc-500">WhatsApp Simulation</p>
          <div className="space-y-3">
            <div className="max-w-[90%] rounded-xl bg-white p-3 text-sm">Hi, thanks for contacting us. May I know your name?</div>
            <div className="ml-auto max-w-[90%] rounded-xl bg-emerald-100 p-3 text-sm">I am Rohan. Need dental implant consult.</div>
            <div className="max-w-[90%] rounded-xl bg-white p-3 text-sm">Great, Rohan. Preferred time: morning, afternoon, or evening?</div>
            <div className="ml-auto max-w-[90%] rounded-xl bg-emerald-100 p-3 text-sm">Evening.</div>
            <div className="max-w-[90%] rounded-xl bg-white p-3 text-sm">Available: 6:00 PM, 6:30 PM, 7:00 PM. Reply 1/2/3 to confirm.</div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-8 md:grid-cols-3">
        <article className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">Problem</p>
          <p className="mt-2 text-sm text-red-800">Clinics lose 30-50% patients due to no follow-up.</p>
        </article>
        <article className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-700">Problem</p>
          <p className="mt-2 text-sm text-amber-800">Staff cannot respond instantly and leads go cold.</p>
        </article>
        <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-700">Solution</p>
          <p className="mt-2 text-sm text-emerald-800">Auto-replies, smart booking, reminders, and recall engine.</p>
        </article>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-8">
        <h2 className="text-2xl font-bold">Results That Matter</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-3xl font-bold text-emerald-700">Recover 20-40% lost patients</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-3xl font-bold text-emerald-700">Reduce no-shows by 50%</p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-8">
        <h2 className="text-2xl font-bold">Pricing</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 p-5">
            <p className="text-xl font-semibold">Starter</p>
            <p className="mt-2 text-sm text-zinc-600">Limited automation, basic reminders, 7-day free trial.</p>
          </div>
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-5">
            <p className="text-xl font-semibold">Growth</p>
            <p className="mt-2 text-sm text-zinc-700">Full WhatsApp automation + recall engine.</p>
          </div>
          <div className="rounded-xl border border-zinc-200 p-5">
            <p className="text-xl font-semibold">Pro</p>
            <p className="mt-2 text-sm text-zinc-600">Advanced analytics and priority support.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="rounded-2xl bg-zinc-900 p-8 text-white">
          <p className="text-2xl font-bold">Get Your First 10 Bookings Guaranteed</p>
          <div className="mt-4">
            <Link href="/book-demo" className="rounded-lg bg-white px-6 py-3 font-semibold text-zinc-900 hover:bg-zinc-100">
              Book Free Demo
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-8 pb-16">
        <DemoBookingForm />
      </section>
    </main>
  )
}
