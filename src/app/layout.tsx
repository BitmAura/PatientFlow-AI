import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import QueryProvider from '@/components/providers/query-provider'
import { LanguageProviderComponent } from '@/hooks/use-language'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils/cn'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
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
          inter.variable,
          plusJakarta.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <LanguageProviderComponent>
              {children}
              <Toaster position="top-right" />
              <Analytics />
            </LanguageProviderComponent>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
