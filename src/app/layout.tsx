import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import QueryProvider from '@/components/providers/query-provider'
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
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export const metadata: Metadata = {
  title: {
    default: 'No Show Killer',
    template: '%s | No Show Killer',
  },
  description:
    'Indian dental and skin clinics use No Show Killer to recover ₹40,000+/month from missed appointments with WhatsApp automation.',
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
    title: 'No Show Killer',
    description:
      'Reduce clinic no-shows with WhatsApp automation built for Indian healthcare teams.',
    url: 'https://auradigitalservices.me',
    siteName: 'No Show Killer',
    images: ['/logo.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'No Show Killer',
    description:
      'Reduce clinic no-shows with WhatsApp automation built for Indian healthcare teams.',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
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
            {children}
            <Toaster position="top-right" />
            <Analytics />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
