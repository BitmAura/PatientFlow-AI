'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { TwentyOneButton } from '@/components/ui/twentyone-button'
import { useTrackCta } from '@/hooks/use-track-cta'

const MONTHLY_FEE = 8999

function formatInr(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(value)))
}

export function RoiCalculator() {
  const trackCta = useTrackCta()
  const [appointments, setAppointments] = useState(200)
  const [noShowRate, setNoShowRate] = useState(25)
  const [appointmentValue, setAppointmentValue] = useState(1500)

  const metrics = useMemo(() => {
    const monthlyNoShows = appointments * (noShowRate / 100)
    const monthlyLost = monthlyNoShows * appointmentValue
    const newNoShowRate = noShowRate * 0.5
    const newNoShows = appointments * (newNoShowRate / 100)
    const monthlyRecovered = (monthlyNoShows - newNoShows) * appointmentValue
    const annualRecovered = monthlyRecovered * 12
    const roi = MONTHLY_FEE > 0 ? ((monthlyRecovered - MONTHLY_FEE) / MONTHLY_FEE) * 100 : 0

    return {
      monthlyNoShows,
      monthlyLost,
      monthlyRecovered,
      annualRecovered,
      roi,
    }
  }, [appointments, noShowRate, appointmentValue])

  return (
    <section className="py-14 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl rounded-3xl border border-emerald-100 bg-[linear-gradient(140deg,#f0fdf4,#ecfeff_40%,#ffffff)] p-6 shadow-xl shadow-emerald-100/70 md:p-10">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="inline-flex rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Dental ROI Calculator
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Estimate Your Real No-Show Revenue Recovery
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                Conservative assumption: 50% no-show reduction. Move the sliders to see what this means for your clinic.
              </p>

              <div className="mt-7 space-y-5">
                <SliderField
                  label="Monthly dental consultations"
                  value={appointments}
                  min={100}
                  max={500}
                  step={10}
                  onChange={setAppointments}
                />
                <SliderField
                  label="Current no-show rate"
                  value={noShowRate}
                  min={10}
                  max={40}
                  step={1}
                  suffix="%"
                  onChange={setNoShowRate}
                />
                <SliderField
                  label="Average consultation value"
                  value={appointmentValue}
                  min={500}
                  max={5000}
                  step={100}
                  prefix="₹"
                  onChange={setAppointmentValue}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg md:p-6">
              <div className="space-y-4">
                <MetricRow label="You're losing / month" value={formatInr(metrics.monthlyLost)} tone="danger" />
                <MetricRow label="PatientFlow AI could save / month" value={formatInr(metrics.monthlyRecovered)} tone="success" />
                <MetricRow label="Annual revenue recovered" value={formatInr(metrics.annualRecovered)} tone="neutral" />
                <MetricRow
                  label={`ROI vs ${formatInr(MONTHLY_FEE)} monthly fee`}
                  value={`${Math.round(metrics.roi)}%`}
                  tone={metrics.roi >= 0 ? 'success' : 'danger'}
                />
              </div>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#ef4444,#f59e0b,#22c55e)] transition-all"
                  style={{ width: `${Math.min(100, Math.max(8, noShowRate * 2.5))}%` }}
                />
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Bar shows your current no-show pressure. Lowering this directly recovers booked revenue.
              </p>

              <Link href="/login?next=/dashboard/billing" className="mt-6 block" onClick={() => trackCta('Get This ROI for Your Clinic', 'roi_calculator', '/login?next=/dashboard/billing')}>
                <TwentyOneButton className="w-full">Get This ROI for Your Clinic</TwentyOneButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  prefix,
  suffix,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  prefix?: string
  suffix?: string
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-4 text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-semibold text-slate-900">
          {prefix}
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-emerald-600"
      />
    </label>
  )
}

function MetricRow({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'success' | 'danger' | 'neutral'
}) {
  const toneStyles =
    tone === 'success'
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : tone === 'danger'
      ? 'text-rose-700 bg-rose-50 border-rose-200'
      : 'text-slate-800 bg-slate-50 border-slate-200'

  return (
    <div className={`rounded-xl border p-3 ${toneStyles}`}>
      <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-xl font-bold tracking-tight">{value}</p>
    </div>
  )
}
