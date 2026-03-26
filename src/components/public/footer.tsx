import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
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
              <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                PatientFlow AI
              </span>
            </Link>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xs">
              Automated appointment management and WhatsApp reminders for modern healthcare practices.
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
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">Product</h3>
            <ul className="mt-4 space-y-3">
              <FooterLink href="/how-it-works">How it Works</FooterLink>
              <FooterLink href="/how-recall-works">Recall System</FooterLink>
              <FooterLink href="/features">Features</FooterLink>
              <FooterLink href="/pricing">Pricing</FooterLink>
              <FooterLink href="/integration">Integrations</FooterLink>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">Company</h3>
            <ul className="mt-4 space-y-3">
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/careers">Careers</FooterLink>
              <FooterLink href="/blog">Blog</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">Contact</h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                <MapPin className="h-5 w-5 shrink-0 text-green-600" />
                <span>123 Healthcare Ave,<br />Medical District, NY 10001</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                <Phone className="h-5 w-5 shrink-0 text-green-600" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                <Mail className="h-5 w-5 shrink-0 text-green-600" />
                <span>hello@patientflow.ai</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-zinc-200 dark:border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            &copy; {currentYear} PatientFlow AI. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-zinc-500 dark:text-zinc-400">
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
      className="text-zinc-400 hover:text-green-600 transition-colors"
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
        className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-green-600 dark:hover:text-green-500 transition-colors"
      >
        {children}
      </Link>
    </li>
  )
}
