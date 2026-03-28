'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { TwentyOneButton } from '@/components/ui/twentyone-button'
import { useTrackCta } from '@/hooks/use-track-cta'

type TrackedCtaLinkProps = {
  href: string
  label: string
  location: string
  children: ReactNode
  tone?: 'primary' | 'secondary'
  className?: string
}

export function TrackedCtaLink({
  href,
  label,
  location,
  children,
  tone = 'primary',
  className,
}: TrackedCtaLinkProps) {
  const trackCta = useTrackCta()

  return (
    <Link href={href} onClick={() => trackCta(label, location, href)}>
      <TwentyOneButton tone={tone} className={className}>
        {children}
      </TwentyOneButton>
    </Link>
  )
}
