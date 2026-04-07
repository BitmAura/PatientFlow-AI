import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-emerald-100 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-10 w-10">
                 <Image 
                   src="/logo.png" 
                   alt="PatientFlow AI" 
                   fill
                   className="object-contain"
                 />
              </div>
              <span className="text-2xl font-bold tracking-tight text-zinc-900">
                PatientFlow AI
              </span>
            </Link>
            <p className="max-w-xs text-sm text-zinc-600">
              Automated appointment management and WhatsApp reminders for modern Indian healthcare practices.
            </p>
            <div className="flex space-x-4">
              <SocialLink href="#" icon={Facebook} />
              <SocialLink href="#" icon={Twitter} />
              <SocialLink href="#" icon={Instagram} />
              <SocialLink href="#" icon={Linkedin} />
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900">Product</h3>
            <ul className="mt-4 space-y-3">
              <FooterLink href="/how-it-works">How it Works</FooterLink>
              <FooterLink href="/how-recall-works">Recall System</FooterLink>
              <FooterLink href="/features">Features</FooterLink>
              <FooterLink href="/blog">Blog</FooterLink>
              <FooterLink href="/pricing">Pricing</FooterLink>
              <FooterLink href="/integration">Integrations</FooterLink>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900">Company</h3>
            <ul className="mt-4 space-y-3">
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/login?next=/dashboard/billing">Subscribe</FooterLink>
              <FooterLink href="/service-selector">Service Selector</FooterLink>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900">Contact</h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-sm text-zinc-600">
                <MapPin className="h-5 w-5 shrink-0 text-green-600" />
                <span>Bangalore, Karnataka, India<br />Remote-first, serving clinics across India</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-zinc-600">
                <Mail className="h-5 w-5 shrink-0 text-green-600" />
                <a href="mailto:support@auradigitalservices.me" className="hover:text-green-700">
                  support@auradigitalservices.me
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-8 md:flex-row">
          <p className="text-sm text-zinc-500">
            &copy; {currentYear} Aura Digital Services. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-zinc-500">
            <Link href="/privacy" className="hover:text-green-600 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-green-600 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function SocialLink({ href, icon: Icon }: { href: string; icon: any }) {
  return (
    <Link 
      href={href} 
      className="text-zinc-400 transition-colors hover:text-green-600"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Icon className="h-5 w-5" />
    </Link>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link 
        href={href} 
        className="text-sm text-zinc-600 transition-colors hover:text-green-600"
      >
        {children}
      </Link>
    </li>
  )
}
