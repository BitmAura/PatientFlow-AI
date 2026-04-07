'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Phone, ChevronRight, ExternalLink, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TwentyOneButton } from '@/components/ui/twentyone-button'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { useTrackCta } from '@/hooks/use-track-cta'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils/cn'

interface UnifiedHeaderProps {
  currentService?: 'noshow'
  logoText?: string
  /** When set, header + nav use app-shell styling (e.g. dark mode) */
  variant?: 'marketing' | 'app'
  /** Merged onto the root `<header>` (e.g. `hidden md:block` for dashboard + mobile subheader) */
  className?: string
  navigationItems?: Array<{
    label: string
    href: string
    external?: boolean
  }>
}

export function UnifiedHeader({ 
  currentService = 'noshow', 
  logoText,
  variant = 'marketing',
  className,
  navigationItems = []
}: UnifiedHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const trackCta = useTrackCta()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const marketingNavItems = [
    { label: 'How it Works', href: '/how-it-works' },
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
  ]

  const dashboardNavItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Appointments', href: '/appointments' },
    { label: 'Patients', href: '/patients' },
    { label: 'Reports', href: '/reports' },
  ]

  const navItems = navigationItems.length > 0 
    ? navigationItems 
    : (variant === 'marketing' ? marketingNavItems : dashboardNavItems)
  
  const config = {
    logo: 'PatientFlow AI',
    tagline: 'Clinical Revenue Engine for Modern Indian Practices.',
    primaryColor: 'emerald',
    ctaText: 'Start Free Trial',
    ctaHref: '/signup',
  }

  const whatsappSalesNumber = process.env.NEXT_PUBLIC_WHATSAPP_SALES_NUMBER
  const whatsappHref = whatsappSalesNumber
    ? `https://wa.me/${whatsappSalesNumber.replace(/\D/g, '')}`
    : null

  const { signOut } = useAuth()
  const isApp = variant === 'app'

  return (
    <header
      role="banner"
      className={cn(
        'fixed left-0 right-0 top-0 z-50 transition-colors duration-300',
        isScrolled
          ? 'border-b border-emerald-100/80 bg-white/90 shadow-md backdrop-blur-md dark:border-emerald-900/30 dark:bg-slate-950/95 dark:shadow-black/40'
          : 'border-b border-emerald-100 bg-white/80 backdrop-blur-md dark:border-emerald-900/40 dark:bg-slate-950/90 dark:backdrop-blur-xl',
        className
      )}
    >
      <div className="container mx-auto px-4">
        {/*
          Mandatory shell: single 80px row, vertically centered.
          Three zones: brand (min-w-0) | primary nav (centered) | CTA + mobile toggle.
        */}
        <div className="flex h-20 min-h-[5rem] w-full items-center justify-between gap-3 md:gap-4">
          {/* Zone 1 — Brand + tagline */}
          <Link
            href="/"
            className="group flex min-w-0 max-w-[min(100%,18rem)] shrink items-center gap-2 sm:max-w-[min(100%,22rem)] sm:gap-3 lg:max-w-md"
          >
            <div className="relative h-11 w-11 shrink-0 sm:h-14 sm:w-14" aria-hidden>
              <Image src="/logo.png" alt="" fill className="object-contain" priority />
            </div>
            <div className="min-w-0 text-left">
              <h1 className="truncate text-lg font-bold leading-tight text-emerald-900 sm:text-xl lg:text-2xl dark:text-emerald-100">
                {logoText || config.logo}
              </h1>
              <p
                className={cn(
                  'mt-0.5 text-[11px] font-medium leading-snug text-slate-600 dark:text-slate-400 sm:text-xs lg:text-sm',
                  isApp ? 'hidden lg:block' : 'block'
                )}
              >
                {config.tagline}
              </p>
            </div>
          </Link>

          {/* Zone 2 — Primary nav (desktop only; centered in remaining space) */}
          <nav
            aria-label="Primary"
            className="mx-2 hidden min-w-0 flex-1 justify-center md:flex"
          >
            <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 lg:gap-x-8">
              {navItems.map((item: any) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={cn(
                      'whitespace-nowrap text-sm font-bold text-zinc-900 transition-colors hover:text-emerald-600 lg:text-base dark:text-slate-100 dark:hover:text-emerald-400',
                      item.external && 'inline-flex items-center gap-1'
                    )}
                    {...(item.external && { target: '_blank', rel: 'noopener noreferrer' })}
                  >
                    {item.label}
                    {item.external && <ExternalLink className="h-4 w-4 shrink-0" />}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Zone 3 — Login + Marketing CTA + mobile menu */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {!isApp && (
              <Link
                href="/login"
                className="hidden md:inline-flex items-center text-sm font-medium text-slate-600 hover:text-emerald-700 transition-colors dark:text-slate-300 dark:hover:text-emerald-400 px-2"
                onClick={() => trackCta('Login', 'header_desktop', '/login')}
              >
                Login
              </Link>
            )}
            <LanguageSwitcher />
            {!isApp && (
              <Link
                href={config.ctaHref}
                className="hidden md:block"
                onClick={() => trackCta(config.ctaText, 'header_desktop', config.ctaHref)}
              >
                <TwentyOneButton className="h-10 px-3 lg:px-4" type="button">
                  <Phone className="mr-2 h-4 w-4" />
                  {config.ctaText}
                </TwentyOneButton>
              </Link>
            )}

            {isApp && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="hidden md:inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              type="button"
              aria-expanded={isMenuOpen}
              aria-controls="unified-header-mobile-panel"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden dark:text-slate-200"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            id="unified-header-mobile-panel"
            className="border-t border-emerald-100 py-4 dark:border-emerald-900/50 md:hidden"
          >
            <nav className="flex flex-col gap-3" aria-label="Mobile">
              {navItems.map((item: any) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-zinc-700 transition-colors hover:bg-emerald-50 dark:text-slate-200 dark:hover:bg-emerald-950/50"
                  {...(item.external && { target: '_blank', rel: 'noopener noreferrer' })}
                >
                  <span className="font-medium">{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              ))}
              
              {!isApp && (
                <>
                  <Link href={config.ctaHref} className="w-full" onClick={() => trackCta(config.ctaText, 'header_mobile_menu', config.ctaHref)}>
                    <TwentyOneButton className="mt-2 w-full" type="button">
                      <Phone className="w-4 h-4 mr-2" />
                      {config.ctaText}
                    </TwentyOneButton>
                  </Link>
                  <Link
                    href="/login"
                    className="flex items-center justify-center w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => { setIsMenuOpen(false); trackCta('Login', 'header_mobile_menu', '/login') }}
                  >
                    Login to Dashboard
                  </Link>
                </>
              )}

              {isApp && (
                <button
                  onClick={() => { setIsMenuOpen(false); signOut() }}
                  className="flex items-center justify-between rounded-lg px-3 py-3 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="h-5 w-5" />
                    <span className="font-bold">Sign Out</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>
              )}
            </nav>
          </div>
        )}
      </div>

      {!isApp && (
        <div className="border-t border-emerald-100 bg-white px-4 py-2 dark:border-emerald-900/50 dark:bg-slate-950/95 md:hidden">
          <div className="mx-auto flex w-full max-w-7xl gap-2">
            <Link href="/login?next=/dashboard/billing" className="flex-1" onClick={() => trackCta('Subscribe now', 'header_mobile_sticky', '/login?next=/dashboard/billing')}>
              <TwentyOneButton className="w-full" type="button">
                Subscribe now
              </TwentyOneButton>
            </Link>
            {whatsappHref && (
              <a href={whatsappHref} className="flex-1" target="_blank" rel="noreferrer" onClick={() => trackCta('WhatsApp', 'header_mobile_sticky', whatsappHref)}>
                <TwentyOneButton tone="secondary" className="w-full" type="button">
                  WhatsApp
                </TwentyOneButton>
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  )
}