import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
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
    default: 'PatientFlow AI',
    template: '%s | PatientFlow AI',
  },
  description: 'Increase Patient Bookings. Reduce No-Shows. Automatically.',
  keywords: [
    'PatientFlow AI',
    'clinic automation',
    'patient bookings',
    'no-show reduction',
    'whatsapp reminders',
    'healthcare SaaS',
  ],
  authors: [
    {
      name: 'PatientFlow AI',
      url: 'https://patientflow.ai',
    },
  ],
  creator: 'PatientFlow AI',
  metadataBase: new URL('https://patientflow.ai'),
  openGraph: {
    title: 'PatientFlow AI',
    description: 'Increase Patient Bookings. Reduce No-Shows. Automatically.',
    url: 'https://patientflow.ai',
    siteName: 'PatientFlow AI',
    images: ['/logo.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PatientFlow AI',
    description: 'Increase Patient Bookings. Reduce No-Shows. Automatically.',
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
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
