import { PortalHeader } from '@/components/portal/portal-header'

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <PortalHeader />
      <main className="container mx-auto max-w-2xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t bg-white py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 PatientFlow AI. All rights reserved.</p>
          <p className="mt-1">Need help? Contact support@auradigitalservices.me</p>
        </div>
      </footer>
    </div>
  )
}
