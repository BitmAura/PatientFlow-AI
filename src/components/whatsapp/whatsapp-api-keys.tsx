import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Key, 
  Eye, 
  EyeOff, 
  Copy, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  HelpCircle
} from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface WhatsAppApiKeysProps {
  onSave: (keys: WhatsAppKeys) => Promise<void>
  initialKeys?: WhatsAppKeys
  isLoading?: boolean
}

export interface WhatsAppKeys {
  phoneNumberId: string
  accessToken: string
  webhookSecret?: string
}

export function WhatsAppApiKeys({ onSave, initialKeys, isLoading }: WhatsAppApiKeysProps) {
  const [keys, setKeys] = useState<WhatsAppKeys>({
    phoneNumberId: initialKeys?.phoneNumberId || '',
    accessToken: initialKeys?.accessToken || '',
    webhookSecret: initialKeys?.webhookSecret || ''
  })
  const [showToken, setShowToken] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [copiedField, setCopiedField] = useState<string>('')
  const { toast } = useToast()

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      toast({
        title: "Copied!",
        description: `${field} copied to clipboard`,
      })
      setTimeout(() => setCopiedField(''), 2000)
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy manually",
        variant: "destructive"
      })
    }
  }

  const handleSave = async () => {
    if (!keys.phoneNumberId || !keys.accessToken) {
      toast({
        title: "Missing required fields",
        description: "Please fill in Phone Number ID and Access Token",
        variant: "destructive"
      })
      return
    }

    try {
      await onSave(keys)
      toast({
        title: "Success!",
        description: "WhatsApp API keys saved successfully",
      })
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save API keys. Please try again.",
        variant: "destructive"
      })
    }
  }

  const isConnected = !!(initialKeys?.phoneNumberId && initialKeys?.accessToken)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-blue-600" />
          <CardTitle>WhatsApp API Configuration</CardTitle>
          {isConnected && (
            <Badge variant="default" className="ml-auto bg-green-100 text-green-800 border-green-200">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          )}
        </div>
        <CardDescription>
          Configure your WhatsApp Business API credentials
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <HelpCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>New to WhatsApp Business API?</strong> 
            <Button 
              variant="link" 
              className="p-0 h-auto ml-1"
              onClick={() => window.open('https://developers.facebook.com/docs/whatsapp/business-management-api/get-started', '_blank')}
            >
              Follow our step-by-step guide
            </Button>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label htmlFor="phone-number-id" className="flex items-center gap-2 mb-2">
              WhatsApp Phone Number ID
              <Badge variant="outline" className="text-xs">Required</Badge>
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
                id="phone-number-id"
                placeholder="123456789012345"
                value={keys.phoneNumberId}
                onChange={(e) => setKeys({ ...keys, phoneNumberId: e.target.value })}
                className="font-mono"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(keys.phoneNumberId, 'Phone Number ID')}
                disabled={!keys.phoneNumberId}
              >
                {copiedField === 'Phone Number ID' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="access-token" className="flex items-center gap-2 mb-2">
              WhatsApp Access Token
              <Badge variant="outline" className="text-xs">Required</Badge>
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
                id="access-token"
                type={showToken ? "text" : "password"}
                placeholder="EAABsBCS123456..."
                value={keys.accessToken}
                onChange={(e) => setKeys({ ...keys, accessToken: e.target.value })}
                className="font-mono"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(keys.accessToken, 'Access Token')}
                disabled={!keys.accessToken}
              >
                {copiedField === 'Access Token' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="webhook-secret" className="flex items-center gap-2 mb-2">
              Webhook Secret (Optional)
              <Badge variant="secondary" className="text-xs">Optional</Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>For advanced webhook security. Set this in your webhook configuration.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <div className="flex gap-2">
              <Input
                id="webhook-secret"
                type={showSecret ? "text" : "password"}
                placeholder="your-webhook-secret"
                value={keys.webhookSecret}
                onChange={(e) => setKeys({ ...keys, webhookSecret: e.target.value })}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Save Configuration
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.open('https://developers.facebook.com/docs/whatsapp/business-management-api/get-started', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Get API Keys
          </Button>
        </div>

        {isConnected && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Your WhatsApp Business API is connected and ready to send messages!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}