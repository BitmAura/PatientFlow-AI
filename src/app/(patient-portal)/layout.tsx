import { PortalHeader } from '@/components/portal/portal-header'
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <PortalHeader />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
          {children}
        </main>
        <footer className="border-t bg-white py-6">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>© 2024 PatientFlow AI. All rights reserved.</p>
            <p className="mt-1">Need help? Contact support@patientflow.ai</p>
          </div>
        </footer>
      </div>
    </NextIntlClientProvider>
  )
}
