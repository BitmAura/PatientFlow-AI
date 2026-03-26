import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  MessageCircle, 
  Smartphone, 
  Users, 
  Clock, 
  Shield, 
  CheckCircle2,
  QrCode,
  Phone,
  Settings
} from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { WhatsAppSetupWizard } from "./whatsapp-setup-wizard"

export function WhatsAppConnectCard() {
  const [showWizard, setShowWizard] = useState(false)
  const [wizardMode, setWizardMode] = useState<'auto' | 'manual'>('auto')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const { toast } = useToast()

  const handleQuickSetup = () => {
    // Validate phone number
    if (!phoneNumber.match(/^\d{10}$/)) {
      toast({
        variant: "destructive",
        title: "Invalid phone number",
        description: "Please enter a 10-digit phone number",
      })
      return
    }

    setWizardMode('auto')
    setShowWizard(true)
  }

  if (showWizard) {
    const formattedPhone = phoneNumber ? `+91${phoneNumber}` : undefined
    return <WhatsAppSetupWizard clinicPhoneNumber={formattedPhone} initialMode={wizardMode} />
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <MessageCircle className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl">WhatsApp Business Setup</CardTitle>
        <CardDescription className="text-base">
          Connect a clinic-owned WhatsApp Business number for automated reminders
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Quick Setup */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-800">Quick Setup (Recommended)</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone" className="text-green-700">Your Clinic Phone Number</Label>
              <div className="flex gap-2 mt-1">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  +91
                </span>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  className="rounded-l-none"
                  maxLength={10}
                />
              </div>
              <p className="text-xs text-green-600 mt-1">
                We&apos;ll activate WhatsApp Business for your clinic
              </p>
            </div>
            
            <Button 
              onClick={handleQuickSetup}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Enable WhatsApp Reminders
            </Button>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid gap-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium">Reduce no-shows by 75%</span>
            <Badge variant="secondary" className="ml-auto">FREE</Badge>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium">Save 2 hours daily on phone calls</span>
            <Badge variant="secondary" className="ml-auto">FREE</Badge>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium">100% secure & HIPAA compliant</span>
            <Badge variant="secondary" className="ml-auto">FREE</Badge>
          </div>
        </div>

        {/* Advanced Setup (Hidden by default) */}
        <div className="border rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Advanced Setup (For IT Teams)
            </span>
            <span className="text-xs text-gray-500">
              {showAdvanced ? "Hide" : "Show"}
            </span>
          </Button>
          
          {showAdvanced && (
            <div className="p-4 border-t bg-gray-50">
              <Alert>
                <AlertDescription className="text-sm">
                  For most clinics, Quick Setup works perfectly. Only use Advanced Setup if you have specific technical requirements or an existing WhatsApp Business account.
                </AlertDescription>
              </Alert>
              
              <div className="mt-4 space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={() => {
                    setWizardMode('manual')
                    setShowWizard(true)
                  }}
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  I have a WhatsApp Business API key
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={() => window.open('mailto:support@patientflow.ai', '_blank')}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  I need help with setup
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>🔒 Your data is encrypted and never shared with third parties</p>
              <p>📱 Uses official WhatsApp Business API for compliance</p>
        </div>
      </CardContent>
    </Card>
  )
}