'use client'

import * as React from 'react'
import { PageContainer } from '@/components/layout/page-container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { WhatsAppConnectCard } from '@/components/whatsapp/whatsapp-connect-card'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, HelpCircle, ShieldCheck } from 'lucide-react'

export default function WhatsAppSettingsPage() {
  return (
    <PageContainer>
      <Breadcrumbs />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">WhatsApp Connection</h1>
        <p className="text-muted-foreground mt-1">
          Manage your WhatsApp integration for automated appointment reminders.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Connection Area */}
        <div className="lg:col-span-2 space-y-6">
          <WhatsAppConnectCard />
          
          {/* Troubleshooting / Status Log (Placeholder for future) */}
          <Card>
            <CardHeader>
              <CardTitle>Connection Health</CardTitle>
              <CardDescription>System status checks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm">Webhook Status</span>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm">Message Queue</span>
                  <span className="text-sm font-medium text-slate-600">Empty</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Last Sync</span>
                  <span className="text-sm font-medium text-slate-600">Just now</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Alert className="bg-blue-50 border-blue-100">
            <HelpCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">How it works</AlertTitle>
            <AlertDescription className="text-blue-700 text-sm mt-2">
                We use the official WhatsApp Business API for compliant, automated reminders from your clinic number.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                <strong>Use a clinic number:</strong> Keep a dedicated clinic number for messaging patients.
              </p>
              <p>
                <strong>Avoid spam:</strong> Sending too many messages to people who haven&apos;t saved your number can get you banned.
              </p>
              <p>
                <strong>Personal touch:</strong> Patients respond better to messages that mention their doctor and appointment details.
              </p>
            </CardContent>
          </Card>

          <Alert variant="destructive" className="bg-red-50 border-red-100 text-red-900">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Important</AlertTitle>
            <AlertDescription className="text-red-700 text-sm mt-2">
                Disconnecting WhatsApp will pause automated reminders until you reconnect.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </PageContainer>
  )
}
