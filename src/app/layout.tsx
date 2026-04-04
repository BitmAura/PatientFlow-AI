import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Providers } from '@/components/providers'
import { cn } from '@/lib/utils/cn'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0f766e' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
}

export const metadata: Metadata = {
  title: {
    default: 'PatientFlow AI',
    template: '%s | PatientFlow AI',
  },
  description:
    'Indian dental and skin clinics use PatientFlow AI to recover ₹40,000+/month from missed appointments with WhatsApp automation.',
  keywords: [
    'clinic appointment software India',
    'WhatsApp clinic automation',
    'reduce no-shows',
    'dental clinic software',
    'patient recall system',
  ],
  authors: [
    {
      name: 'Aura Digital Services',
      url: 'https://auradigitalservices.me',
    },
  ],
  creator: 'Aura Digital Services',
  metadataBase: new URL('https://auradigitalservices.me'),
  openGraph: {
    title: 'PatientFlow AI',
    description:
      'Reduce clinic no-shows with WhatsApp automation built for Indian healthcare teams.',
    url: 'https://auradigitalservices.me',
    siteName: 'PatientFlow AI',
    images: ['/logo.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PatientFlow AI',
    description:
      'Reduce clinic no-shows with WhatsApp automation built for Indian healthcare teams.',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/icon',
    shortcut: '/icon',
    apple: '/icon',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          plusJakarta.variable
        )}
      >
        <Providers>
          {children}
          <Analytics />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "How does PatientFlow AI reduce clinic no-shows?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "By using automated WhatsApp reminders and patient journey automation, clinics can reduce missed appointments by up to 60% compared to manual phone calls."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Is PatientFlow AI compliant with Indian medical regulations?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yes, PatientFlow AI is designed for DISHA compliance (Digital Information Security in Healthcare Act) to ensure patient data privacy and secure communication for Indian clinics."
                    }
                  }
                ]
              })
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
