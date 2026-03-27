'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Phone, ChevronRight, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UnifiedHeaderProps {
  currentService?: 'noshow'
  logoText?: string
  navigationItems?: Array<{
    label: string
    href: string
    external?: boolean
  }>
}

export function UnifiedHeader({ 
  currentService = 'noshow', 
  logoText,
  navigationItems = []
}: UnifiedHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

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
    tagline: 'Increase Patient Bookings. Reduce No-Shows. Automatically.',
    primaryColor: 'green',
    ctaText: 'Start Free Trial',
    ctaHref: '/signup',
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 shadow-md backdrop-blur-md' : 'border-b border-emerald-100 bg-white/80 backdrop-blur-md'
      }`}
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
              <h1 className="text-2xl font-bold text-emerald-900">
                {logoText || config.logo}
              </h1>
              <p className="text-sm font-medium text-slate-600">{config.tagline}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item: any) => (
              <Link
                key={item.label}
                href={item.href}
                className={`text-base font-bold text-zinc-900 transition-colors hover:text-emerald-600 ${
                  item.external ? 'flex items-center gap-1' : ''
                }`}
                {...(item.external && { target: '_blank', rel: 'noopener noreferrer' })}
              >
                {item.label}
                {item.external && <ExternalLink className="w-4 h-4" />}
              </Link>
            ))}
            
            <Link href={config.ctaHref}>
              <Button 
                className="bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500"
                size="sm"
              >
                <Phone className="w-4 h-4 mr-2" />
                {config.ctaText}
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="border-t border-emerald-100 py-4 md:hidden">
            <nav className="flex flex-col gap-3">
              {navItems.map((item: any) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-zinc-700 transition-colors hover:bg-emerald-50"
                  {...(item.external && { target: '_blank', rel: 'noopener noreferrer' })}
                >
                  <span className="font-medium">{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              ))}
              
              <Link href={config.ctaHref} className="w-full">
                <Button 
                  className="mt-2 w-full bg-emerald-600 text-white hover:bg-emerald-500"
                  size="sm"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {config.ctaText}
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}