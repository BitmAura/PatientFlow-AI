import { UnifiedHeader } from '@/components/shared/unified-header'
import { Footer } from '@/components/public/footer'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navigationItems = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '/features' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Blog', href: '/blog' },
    { label: 'About', href: '/about' },
    { label: 'Pricing', href: '/pricing' },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <UnifiedHeader 
        currentService="noshow" 
        navigationItems={navigationItems}
      />
      <main className="flex-1 pt-20">
        {children}
      </main>
      <Footer />
    </div>
  )
}
