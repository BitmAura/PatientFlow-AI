'use client'

import * as React from 'react'
import QueryClientProvider from '@/components/providers/query-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { OfflineIndicator } from '@/components/shared/offline-indicator'
import { UpdatePrompt } from '@/components/shared/update-prompt'
import { LanguageProviderComponent } from '@/hooks/use-language'
import { PostHogProvider } from '@/components/providers/posthog-provider'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <PostHogProvider>
          <LanguageProviderComponent>
            <TooltipProvider>
              {children}
              <Toaster position="top-right" />
              <OfflineIndicator />
              <UpdatePrompt />
            </TooltipProvider>
          </LanguageProviderComponent>
        </PostHogProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
