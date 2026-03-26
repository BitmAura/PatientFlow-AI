import { useState, useEffect } from 'react'
import { X, ArrowRight, Stethoscope, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ServicePopupProps {
  isOpen?: boolean
  onClose?: () => void
  currentPage?: 'neutral' | 'patientflow'
}

export function ServicePopup({ isOpen = true, onClose, currentPage = 'neutral' }: ServicePopupProps) {
  const [showPopup, setShowPopup] = useState(isOpen)

  useEffect(() => {
    // Check if user has seen the popup before
    const hasSeenPopup = localStorage.getItem('hasSeenServicePopup')
    if (!hasSeenPopup) {
      setShowPopup(true)
    }
  }, [])

  const handleClose = () => {
    setShowPopup(false)
    localStorage.setItem('hasSeenServicePopup', 'true')
    onClose?.()
  }

  const handleServiceClick = () => {
    window.location.href = '/service-selector'
    handleClose()
  }

  if (!showPopup) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="absolute top-4 right-4"
        >
          <X className="w-4 h-4" />
        </Button>

        <CardHeader className="text-center pb-2">
          <Badge variant="secondary" className="mb-3 bg-gradient-to-r from-blue-100 to-green-100 text-blue-700 mx-auto">
            🏥 Healthcare Growth Platform
          </Badge>
          <CardTitle className="text-2xl text-gray-900">
            PatientFlow AI
          </CardTitle>
          <CardDescription className="text-base">
            No-show reduction and recall automation for modern clinics
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* PatientFlow AI */}
          <div 
            onClick={handleServiceClick}
            className="p-4 border-2 border-green-200 rounded-lg hover:border-green-300 hover:bg-green-50 cursor-pointer transition-all duration-200 group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <Stethoscope className="w-6 h-6 text-green-600" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-lg text-gray-900">PatientFlow AI</h3>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">Primary</Badge>
                </div>
                <p className="text-gray-600 mb-2">Reduce no-shows and automate patient communication</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>• WhatsApp Reminders</span>
                  <span>• Online Booking</span>
                  <span>• No-Show Prevention</span>
                </div>
              </div>
              
              <ArrowRight className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Marketing services small block */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-700" />
                Digital Marketing Services (Optional)
              </h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Need patient acquisition support too? Explore SEO, ads, and local marketing services.
            </p>
            <a
              href="https://wa.me/919148868413?text=Hi%2C%20I%20need%20digital%20marketing%20support%20for%20my%20clinic."
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Explore Marketing Services
              </Button>
            </a>
          </div>

          {/* Don't show again */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleClose}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Don&apos;t show this again
            </button>
            <div className="text-xs text-gray-400">
              💡 PatientFlow AI is your primary workflow
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
