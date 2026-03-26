'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Phone, ChevronRight, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ServiceToggle } from './service-toggle'

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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-sm shadow-md' 
        : 'bg-white border-b border-gray-100'
    }`}>
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
              <h1 className={`font-bold text-2xl ${
                'text-green-900'
              }`}>
                {logoText || config.logo}
              </h1>
              <p className="text-sm text-gray-600 font-medium">{config.tagline}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item: any) => (
              <Link
                key={item.label}
                href={item.href}
                className={`text-base font-bold text-zinc-900 transition-colors hover:text-${config.primaryColor}-600 ${
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
                className={`bg-${config.primaryColor}-600 hover:bg-${config.primaryColor}-700`}
                size="sm"
              >
                <Phone className="w-4 h-4 mr-2" />
                {config.ctaText}
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2">
            <ServiceToggle currentService={currentService} />
            
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
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col gap-3">
              {navItems.map((item: any) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center justify-between py-2 px-3 rounded-lg text-zinc-700 hover:bg-${config.primaryColor}-50 transition-colors`}
                  {...(item.external && { target: '_blank', rel: 'noopener noreferrer' })}
                >
                  <span className="font-medium">{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              ))}
              
              <Link href={config.ctaHref} className="w-full">
                <Button 
                  className={`w-full bg-${config.primaryColor}-600 hover:bg-${config.primaryColor}-700 mt-2`}
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