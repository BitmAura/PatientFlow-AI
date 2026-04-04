'use client'

import dynamic from 'next/dynamic'

/**
 * Aura ROI Wrapper
 * 🧬 Persona: Performance Specialist
 * ⚡ Purpose: Safely handle Client-only dynamic loading in a Server Component environment.
 */
const RoiCalculator = dynamic(
  () => import('@/components/public/roi-calculator').then(mod => mod.RoiCalculator),
  {
    loading: () => <div className="h-96 w-full animate-pulse bg-slate-100 rounded-3xl" />,
    ssr: false
  }
)

export function AuraRoiSection() {
  return (
    <div className="bg-white py-14 md:py-20 lg:py-28 dark:bg-slate-900/40">
      <div className="container mx-auto px-4">
        <RoiCalculator />
      </div>
    </div>
  )
}
