'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  Loader2, 
  Copy,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Info,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface GupshupSetupWizardProps {
  clinicId: string
  onComplete?: (config: {
    appId: string
    apiKey: string
    phoneNumberId: string
  }) => void
}

export function GupshupSetupWizard({ clinicId, onComplete }: GupshupSetupWizardProps) {
  const { toast } = useToast()
  const [step, setStep] = React.useState<'auto' | 'manual' | 'credentials' | 'verify'>('auto')
  const [loading, setLoading] = React.useState(false)
  const [showSecrets, setShowSecrets] = React.useState(false)
  
  // Form state
  const [phoneNumber, setPhoneNumber] = React.useState('')
  const [appId, setAppId] = React.useState('')
  const [apiKey, setApiKey] = React.useState('')
  const [phoneNumberId, setPhoneNumberId] = React.useState('')
  const [otp, setOtp] = React.useState('')

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
    })
  }

  const handleStartAutoSetup = async () => {
    if (!phoneNumber.match(/^\+?[1-9]\d{1,14}$/)) {
      toast({
        title: 'Invalid phone number',
        description: 'Please enter a valid phone number (e.g., +919988776655)',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/whatsapp/register-number', {
        method: 'POST',
        body: JSON.stringify({ phone_number: phoneNumber }),
      })
      
      if (!res.ok) throw new Error('Registration failed')
      
      const data = await res.json()
      toast({
        title: 'Registration started',
        description: 'Check your phone for the OTP',
      })
      
      setStep('verify')
    } catch (error) {
      toast({
        title: 'Setup failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleManualSetupSubmit = async () => {
    if (!appId || !apiKey || !phoneNumberId) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/whatsapp/connect', {
        method: 'POST',
        body: JSON.stringify({
          provider: 'gupshup',
          appId,
          apiKey,
          phoneNumberId,
        }),
      })
      
      if (!res.ok) throw new Error('Connection failed')
      
      const data = await res.json()
      toast({
        title: 'WhatsApp connected!',
        description: 'Gupshup integration is ready',
      })
      
      onComplete?.({
        appId,
        apiKey,
        phoneNumberId,
      })
    } catch (error) {
      toast({
        title: 'Connection failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl space-y-6">
      <Tabs value={step} onValueChange={(value) => setStep(value as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="auto" disabled={step !== 'auto' && step !== 'verify'}>
            <span className="hidden sm:inline">Quick Setup</span>
            <span className="sm:hidden">Quick</span>
          </TabsTrigger>
          <TabsTrigger value="manual">Manual Setup</TabsTrigger>
        </TabsList>

        {/* Quick Setup */}
        <TabsContent value="auto" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Quick Setup (Recommended)
              </CardTitle>
              <CardDescription>
                We'll register your WhatsApp number on Gupshup for you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 'auto' ? (
                <>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>No Gupshup account yet?</AlertTitle>
                    <AlertDescription>
                      We'll create and configure it for you. You just need to verify your phone number with an OTP.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div>
                      <Label>WhatsApp Business Phone Number</Label>
                      <Input
                        type="tel"
                        placeholder="+919988776655"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        disabled={loading}
                      />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Your clinic's WhatsApp number (must be able to receive SMS)
                      </p>
                    </div>

                    <Button
                      onClick={handleStartAutoSetup}
                      disabled={loading}
                      size="lg"
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          Start Registration
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : null}

              {step === 'verify' ? (
                <>
                  <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <p className="text-sm font-medium text-green-900">
                        OTP sent to {phoneNumber}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Enter OTP</Label>
                      <Input
                        type="text"
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        disabled={loading}
                      />
                      <p className="mt-2 text-sm text-muted-foreground">
                        6-digit code sent to your phone (valid for 10 minutes)
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setStep('auto')}
                        disabled={loading}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleManualSetupSubmit}
                        disabled={loading || otp.length !== 6}
                        size="lg"
                        className="flex-1"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            Verify OTP
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual Setup */}
        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manual Setup</CardTitle>
              <CardDescription>
                Already have a Gupshup account? Enter your credentials here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Need help?</AlertTitle>
                <AlertDescription>
                  See{' '}
                  <a
                    href="/docs/GUPSHUP-SETUP-GUIDE.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-foreground"
                  >
                    Gupshup Setup Guide
                  </a>
                  {' '}for step-by-step instructions
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label>Gupshup App ID</Label>
                  <div className="flex gap-2">
                    <Input
                      type={showSecrets ? 'text' : 'password'}
                      placeholder="Your App ID"
                      value={appId}
                      onChange={(e) => setAppId(e.target.value)}
                      disabled={loading}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSecrets(!showSecrets)}
                    >
                      {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>API Key (Token)</Label>
                  <Input
                    type={showSecrets ? 'text' : 'password'}
                    placeholder="Your API Key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    disabled={loading}
                  />
                  <p className="mt-2 text-sm text-muted-foreground">
                    From Gupshup API & SDK section
                  </p>
                </div>

                <div>
                  <Label>Phone Number ID</Label>
                  <Input
                    type="tel"
                    placeholder="919988776655"
                    value={phoneNumberId}
                    onChange={(e) => setPhoneNumberId(e.target.value)}
                    disabled={loading}
                  />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your registered WhatsApp number (digits only)
                  </p>
                </div>

                <Button
                  onClick={handleManualSetupSubmit}
                  disabled={loading || !appId || !apiKey || !phoneNumberId}
                  size="lg"
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      Connect WhatsApp
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Button variant="outline" asChild>
              <a href="https://gupshup.io" target="_blank" rel="noopener noreferrer">
                Create Gupshup Account
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://gupshup.io/dashboard" target="_blank" rel="noopener noreferrer">
                Gupshup Dashboard
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <h4 className="font-semibold text-blue-900">💡 Why Gupshup?</h4>
            <ul className="space-y-1 text-blue-800">
              <li>✅ Messages from your clinic's WhatsApp number</li>
              <li>✅ Verified infrastructure for reliable delivery</li>
              <li>✅ India-optimized with low latency</li>
              <li>✅ Cost-effective per-message pricing</li>
              <li>✅ TRAI & DISHA compliant</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}