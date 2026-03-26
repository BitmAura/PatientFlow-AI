import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CheckCircle2, 
  MessageCircle, 
  Smartphone, 
  Users, 
  Clock, 
  Shield, 
  Copy, 
  ExternalLink,
  HelpCircle,
  Zap,
  Settings,
  Phone,
  ChevronDown
} from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useWhatsApp } from "@/hooks/use-whatsapp"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"

interface WhatsAppSetupWizardProps {
  clinicPhoneNumber?: string
  initialMode?: 'auto' | 'manual'
}

export function WhatsAppSetupWizard({ clinicPhoneNumber, initialMode = 'auto' }: WhatsAppSetupWizardProps) {
  const [step, setStep] = useState(1)
  const [isConnecting, setIsConnecting] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [phoneId, setPhoneId] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')
  const [useAutoSetup, setUseAutoSetup] = useState(initialMode === 'auto')
  const { toast } = useToast()
  const { startAutoSetup, saveApiKeys } = useWhatsApp()

  const handleAutoConnect = async () => {
    setIsConnecting(true)
    setStep(2)

    try {
      if (!clinicPhoneNumber) {
        throw new Error('Missing clinic phone number')
      }
      await startAutoSetup(clinicPhoneNumber)
      setStep(3)
      toast({
        title: 'Setup submitted',
        description: 'We are verifying your WhatsApp Business account.',
      })
    } catch (error) {
      toast({
        title: 'Setup failed',
        description: 'Please try again or contact support.',
        variant: 'destructive'
      })
      setStep(1)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleManualConnect = async () => {
    if (!apiKey || !phoneId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setIsConnecting(true)

    try {
      await saveApiKeys({
        phoneNumberId: phoneId,
        accessToken: apiKey,
        webhookSecret: webhookSecret || undefined
      })
      setStep(4)
      toast({
        title: 'WhatsApp Connected!',
        description: 'Your API credentials are saved and active.',
      })
    } catch (error) {
      toast({
        title: 'Connection failed',
        description: 'Please verify the credentials and try again.',
        variant: 'destructive'
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const benefits = [
    { icon: <MessageCircle className="w-5 h-5" />, text: "Automatic appointment reminders" },
    { icon: <Users className="w-5 h-5" />, text: "Reduce no-shows by 75%" },
    { icon: <Clock className="w-5 h-5" />, text: "Save 2 hours daily on phone calls" },
    { icon: <Shield className="w-5 h-5" />, text: "100% secure & HIPAA compliant" },
  ]

  if (step === 1) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Smartphone className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Connect WhatsApp Business</CardTitle>
          <CardDescription className="text-base">
            Send automatic appointment reminders to your patients via WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Setup Method Selection */}
          <div className="grid md:grid-cols-2 gap-4">
            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                useAutoSetup ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setUseAutoSetup(true)}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                  useAutoSetup ? 'border-green-500 bg-green-500' : 'border-gray-300'
                }`}>
                  {useAutoSetup && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-green-600" />
                    <h3 className="font-semibold">Quick Setup (Recommended)</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    We&apos;ll create your WhatsApp Business account automatically. No technical knowledge required.
                  </p>
                  <Badge variant="secondary" className="mt-2">2 minutes</Badge>
                </div>
              </div>
            </div>

            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                !useAutoSetup ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setUseAutoSetup(false)}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                  !useAutoSetup ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`}>
                  {!useAutoSetup && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Settings className="w-4 h-4 text-blue-600" />
                    <h3 className="font-semibold">Manual Setup</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Use your existing Meta Developer account and WhatsApp Business API credentials.
                  </p>
                  <Badge variant="secondary" className="mt-2">5-10 minutes</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-green-600">{benefit.icon}</div>
                <span className="text-sm font-medium">{benefit.text}</span>
                <Badge variant="secondary" className="ml-auto">FREE</Badge>
              </div>
            ))}
          </div>

          {/* Auto Setup Button */}
          {useAutoSetup && (
            <Button 
              onClick={handleAutoConnect} 
              disabled={isConnecting}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Setting up WhatsApp...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Enable WhatsApp Reminders
                </>
              )}
            </Button>
          )}

          {/* Manual Setup Form */}
          {!useAutoSetup && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Enter Your API Credentials</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://developers.facebook.com/docs/whatsapp/business-management-api/get-started', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Get Help
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="phone-id" className="flex items-center gap-2">
                    WhatsApp Phone Number ID
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Find this in your Meta Developer dashboard under WhatsApp &gt; Getting Started</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="phone-id"
                      placeholder="123456789012345"
                      value={phoneId}
                      onChange={(e) => setPhoneId(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(phoneId, 'Phone ID')}
                      disabled={!phoneId}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="api-key" className="flex items-center gap-2">
                    WhatsApp Access Token
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Generate this in your Meta Developer dashboard under WhatsApp &gt; Getting Started</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="EAABsBCS123456..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(apiKey, 'Access Token')}
                      disabled={!apiKey}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="webhook-secret" className="flex items-center gap-2">
                    Webhook Secret (Optional)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Optional: Set this in your webhook configuration for extra security</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    id="webhook-secret"
                    placeholder="your-webhook-secret"
                    value={webhookSecret}
                    onChange={(e) => setWebhookSecret(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                onClick={handleManualConnect} 
                disabled={isConnecting}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Testing Connection...
                  </>
                ) : (
                  <>
                    <Phone className="w-5 h-5 mr-2" />
                    Connect WhatsApp
                  </>
                )}
              </Button>
            </div>
          )}

          <Alert>
            <HelpCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Need help?</strong> Our support team can set this up for you in 5 minutes. 
              <Button variant="link" className="p-0 h-auto" onClick={() => window.open('mailto:support@noshowkiller.com', '_blank')}>
                Contact Support
              </Button>
            </AlertDescription>
          </Alert>

          {/* FAQ Section */}
          <div className="pt-6 border-t mt-6">
            <h3 className="font-semibold mb-4 text-lg">Common Questions</h3>
            <div className="space-y-2">
              <FAQItem 
                question="Can I keep using my WhatsApp app on this number?" 
                answer="No. Once connected to Aura Recall, this number will work exclusively through our dashboard. The standard WhatsApp app on your phone will stop working for this number. We strongly recommend using a dedicated secondary number for this system."
              />
              <FAQItem 
                question="Will patients know this is automated?" 
                answer="Not necessarily. The messages come from your official business account but are written to sound like a polite staff member. Most patients simply appreciate the helpful nudge."
              />
              <FAQItem 
                question="Can patients reply normally?" 
                answer="Yes! When patients reply, their messages appear instantly in your Aura dashboard. Your staff can reply back manually from their computer or mobile, just like a regular chat."
              />
              <FAQItem 
                question="What if my phone is switched off?" 
                answer="It keeps working. Since Aura Recall uses the Cloud API, it runs 24/7 on our secure servers. Your phone can be off, broken, or without internet—reminders will still go out on time."
              />
              <FAQItem 
                question="Can I stop or change the number later?" 
                answer="Yes. You retain full control. You can disconnect the number or switch to a different one at any time from your settings."
              />
              <FAQItem 
                question="Is this approved by WhatsApp?" 
                answer="Yes, 100%. We use the official WhatsApp Business API, which is the legitimate, safe way to send automated health reminders without getting banned."
              />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Loading states for steps 2 and 3
  if (step === 2) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="animate-pulse">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold">{useAutoSetup ? 'Submitting WhatsApp request' : 'Testing API Connection'}</h3>
              <p className="text-sm text-gray-600">
                {useAutoSetup ? 'Collecting details for verification...' : 'Verifying your credentials...'}
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full w-1/3 animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (step === 3) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="animate-pulse">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Pending Activation</h3>
              <p className="text-sm text-gray-600">
                {useAutoSetup ? 'We will activate your clinic number within 24 hours.' : 'Configuring message settings...'}
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full w-2/3 animate-pulse" />
            </div>
            <Button variant="outline" onClick={() => setStep(1)}>
              Back to Setup
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Success state
  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-green-600">WhatsApp Connected!</h3>
            <p className="text-sm text-gray-600">
              {useAutoSetup ? 'Your clinic number is active for automated reminders' : 'Your API is working perfectly'}
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs text-green-800">
              ✅ Appointment confirmations<br/>
              ✅ 24-hour reminders<br/>
              ✅ Follow-up messages
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => setStep(1)} 
              variant="outline" 
              className="flex-1"
            >
              Test WhatsApp Message
            </Button>
            <Button 
              onClick={() => window.location.href = '/settings/whatsapp'} 
              variant="default" 
              className="flex-1"
            >
              Configure Settings
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg px-4 bg-white">
      <CollapsibleTrigger className="flex items-center justify-between w-full font-medium text-sm py-3 hover:text-green-700 text-left">
        {question}
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="text-sm text-gray-600 pb-3 pt-0 leading-relaxed">
        {answer}
      </CollapsibleContent>
    </Collapsible>
  )
}