'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Phone, ChevronRight, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TwentyOneButton } from '@/components/ui/twentyone-button'
import { useTrackCta } from '@/hooks/use-track-cta'
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

  const defaultNavItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Appointments', href: '/appointments' },
    { label: 'Patients', href: '/patients' },
    { label: 'Reports', href: '/reports' },
  ]

  const navItems = navigationItems.length > 0 ? navigationItems : defaultNavItems
  
  const config = {
    logo: 'PatientFlow AI',
    tagline: 'Reduce no-shows with WhatsApp automation for Indian clinics.',
    primaryColor: 'green',
    ctaText: 'Book Free Demo',
    ctaHref: '/book-demo',
  }

  const whatsappSalesNumber = process.env.NEXT_PUBLIC_WHATSAPP_SALES_NUMBER
  const whatsappHref = whatsappSalesNumber
    ? `https://wa.me/${whatsappSalesNumber.replace(/\D/g, '')}`
    : null

  const isApp = variant === 'app'

  return (
    <header
      className={cn(
        'fixed left-0 right-0 top-0 z-50 transition-colors duration-300',
        isScrolled
          ? 'border-b border-emerald-100/80 bg-white/90 shadow-md backdrop-blur-md dark:border-emerald-900/30 dark:bg-slate-950/95 dark:shadow-black/40'
          : 'border-b border-emerald-100 bg-white/80 backdrop-blur-md dark:border-emerald-900/40 dark:bg-slate-950/90 dark:backdrop-blur-xl',
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-14 h-14">
               <Image 
                 src="/logo.png" 
                 alt="PatientFlow AI Logo" 
                 fill
                 className="object-contain"
                 priority
               />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                {logoText || config.logo}
              </h1>
              <p
                className={cn(
                  'text-sm font-medium text-slate-600 dark:text-slate-400',
                  isApp && 'hidden lg:block'
                )}
              >
                {config.tagline}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item: any) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'text-base font-bold text-zinc-900 transition-colors hover:text-emerald-600 dark:text-slate-100 dark:hover:text-emerald-400',
                  item.external && 'flex items-center gap-1'
                )}
                {...(item.external && { target: '_blank', rel: 'noopener noreferrer' })}
              >
                {item.label}
                {item.external && <ExternalLink className="w-4 h-4" />}
              </Link>
            ))}
            
            <Link href={config.ctaHref} onClick={() => trackCta(config.ctaText, 'header_desktop', config.ctaHref)}>
              <TwentyOneButton className="h-10 px-4" type="button">
                <Phone className="w-4 h-4 mr-2" />
                {config.ctaText}
              </TwentyOneButton>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden dark:text-slate-200"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="border-t border-emerald-100 py-4 dark:border-emerald-900/50 md:hidden">
            <nav className="flex flex-col gap-3">
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
              
              <Link href={config.ctaHref} className="w-full" onClick={() => trackCta(config.ctaText, 'header_mobile_menu', config.ctaHref)}>
                <TwentyOneButton className="mt-2 w-full" type="button">
                  <Phone className="w-4 h-4 mr-2" />
                  {config.ctaText}
                </TwentyOneButton>
              </Link>
            </nav>
          </div>
        )}
      </div>

      <div className="border-t border-emerald-100 bg-white px-4 py-2 dark:border-emerald-900/50 dark:bg-slate-950/95 md:hidden">
        <div className="mx-auto flex w-full max-w-7xl gap-2">
          <Link href={config.ctaHref} className="flex-1" onClick={() => trackCta('Book Demo', 'header_mobile_sticky', config.ctaHref)}>
            <TwentyOneButton className="w-full" type="button">
              Book Demo
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
    </header>
  )
}