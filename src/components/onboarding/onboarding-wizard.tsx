import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  User, 
  Building2 as Hospital, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Calendar,
  Phone,
  MessageCircle
} from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

const steps = [
  {
    id: 1,
    title: "Welcome to PatientFlow AI",
    description: "Let's get your clinic set up in just 2 minutes",
    icon: <Hospital className="w-8 h-8 text-blue-600" />,
    component: "WelcomeStep"
  },
  {
    id: 2,
    title: "Clinic Information",
    description: "Tell us about your practice",
    icon: <User className="w-8 h-8 text-blue-600" />,
    component: "ClinicStep"
  },
  {
    id: 3,
    title: "Working Hours",
    description: "Set your availability",
    icon: <Clock className="w-8 h-8 text-blue-600" />,
    component: "HoursStep"
  },
  {
    id: 4,
    title: "Connect WhatsApp",
    description: "Get your official business line ready",
    icon: <MessageCircle className="w-8 h-8 text-blue-600" />,
    component: "CommunicationStep"
  },
  {
    id: 5,
    title: "You're All Set!",
    description: "Start reducing no-shows today",
    icon: <CheckCircle2 className="w-8 h-8 text-green-600" />,
    component: "CompleteStep"
  }
]

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
        <Hospital className="w-10 h-10 text-blue-600" />
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-2">Welcome to PatientFlow AI!</h3>
        <p className="text-gray-600 mb-6">
          We&apos;re excited to help you reduce no-shows and grow your practice. 
          This quick setup will take just 2 minutes.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">What you&apos;ll get:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>✅ Automatic appointment reminders</li>
          <li>✅ Online booking for patients</li>
          <li>✅ Real-time availability management</li>
          <li>✅ Patient management system</li>
        </ul>
      </div>

      <Button onClick={onNext} className="w-full" size="lg">
        Get Started
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  )
}

function ClinicStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [clinicName, setClinicName] = useState("")
  const [doctorName, setDoctorName] = useState("")
  const [specialization, setSpecialization] = useState("")

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Tell us about your clinic</h3>
        <p className="text-gray-600">This helps us personalize your experience</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Clinic Name *</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Dr. Smith's Dental Clinic"
            value={clinicName}
            onChange={(e) => setClinicName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Doctor Name *</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Dr. John Smith"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Specialization *</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
          >
            <option value="">Select specialization</option>
            <option value="general">General Medicine</option>
            <option value="dental">Dental</option>
            <option value="dermatology">Dermatology</option>
            <option value="cardiology">Cardiology</option>
            <option value="orthopedic">Orthopedic</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1">
          Back
        </Button>
        <Button 
          onClick={onNext} 
          className="flex-1"
          disabled={!clinicName || !doctorName || !specialization}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

function HoursStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [workingDays, setWorkingDays] = useState<string[]>(['mon', 'tue', 'wed', 'thu', 'fri'])
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("18:00")

  const days = [
    { id: 'mon', label: 'Monday' },
    { id: 'tue', label: 'Tuesday' },
    { id: 'wed', label: 'Wednesday' },
    { id: 'thu', label: 'Thursday' },
    { id: 'fri', label: 'Friday' },
    { id: 'sat', label: 'Saturday' },
    { id: 'sun', label: 'Sunday' },
  ]

  const toggleDay = (dayId: string) => {
    if (workingDays.includes(dayId)) {
      setWorkingDays(workingDays.filter(d => d !== dayId))
    } else {
      setWorkingDays([...workingDays, dayId])
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Set your working hours</h3>
        <p className="text-gray-600">Patients will only see available slots during these times</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-3">Working Days</label>
          <div className="grid grid-cols-2 gap-2">
            {days.map(day => (
              <button
                key={day.id}
                onClick={() => toggleDay(day.id)}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  workingDays.includes(day.id)
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Time</label>
            <input
              type="time"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Time</label>
            <input
              type="time"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1">
          Back
        </Button>
        <Button 
          onClick={onNext} 
          className="flex-1"
          disabled={workingDays.length === 0}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

function CommunicationStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  
  const handlePhoneSubmit = () => setStep(2)
  const handleOtpSubmit = () => setStep(3)
  const handleLogoSubmit = () => setStep(4)

  return (
    <div className="space-y-6">
      {/* Step 1: Phone Number */}
      {step === 1 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">What&apos;s your clinic&apos;s WhatsApp number?</h3>
            <p className="text-gray-600">We&apos;ll send a verification code to confirm it&apos;s you.</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">WhatsApp Number</label>
            <div className="flex gap-2">
              <div className="flex items-center px-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                +91
              </div>
              <input
                type="tel"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <Button 
            onClick={handlePhoneSubmit} 
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={phone.length < 10}
          >
            Send Verification Code
          </Button>
        </div>
      )}

      {/* Step 2: OTP */}
      {step === 2 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">Check your WhatsApp</h3>
            <p className="text-gray-600">We sent a 6-digit code to +91 {phone}</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Enter OTP</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-center text-2xl tracking-widest"
              placeholder="0 0 0 0 0 0"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              autoFocus
            />
          </div>
          <Button 
            onClick={handleOtpSubmit} 
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={otp.length < 6}
          >
            Verify & Continue
          </Button>
          <button onClick={() => setStep(1)} className="w-full text-sm text-gray-500 hover:text-gray-700">
            Change Number
          </button>
        </div>
      )}

      {/* Step 3: Logo Upload (Optional) */}
      {step === 3 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">Add your clinic logo</h3>
            <p className="text-gray-600">This will show up in your WhatsApp messages. Optional!</p>
          </div>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Hospital className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-700">Click to upload logo</p>
            <p className="text-xs text-gray-500 mt-1">JPG or PNG, max 2MB</p>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleLogoSubmit} variant="outline" className="flex-1">
              Skip for now
            </Button>
            <Button onClick={handleLogoSubmit} className="flex-1 bg-green-600 hover:bg-green-700">
              Upload & Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Success / Go Live */}
      {step === 4 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">You&apos;re Ready to Go Live!</h3>
            <p className="text-gray-600">Your WhatsApp Business account is connected.</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg text-left">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">Verified Business Name</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">Official Green Tick Requested</span>
            </div>
          </div>

          <Button onClick={onNext} className="w-full bg-green-600 hover:bg-green-700" size="lg">
            Complete Setup
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}

function CompleteStep({ onFinish }: { onFinish: () => void }) {
  const router = useRouter()

  const handleFinish = () => {
    router.push('/dashboard')
  }

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-2xl font-semibold text-green-600 mb-2">🎉 You&apos;re All Set!</h3>
        <p className="text-gray-600 mb-6">
          Your clinic is now ready to reduce no-shows and streamline appointments.
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-800 mb-2">What happens next?</h4>
        <ul className="text-sm text-green-700 space-y-1 text-left">
          <li>✅ Your booking page is live and ready</li>
          <li>✅ Automatic reminders are configured</li>
          <li>✅ Patient management system is active</li>
          <li>✅ You&apos;ll get your first booking soon!</li>
        </ul>
      </div>

      <Button onClick={handleFinish} className="w-full" size="lg">
        Go to Dashboard
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>

      <p className="text-xs text-gray-500">
        Need help? Our support team is available 24/7 at support@auradigitalservices.me
      </p>
    </div>
  )
}

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0)

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const StepComponent = () => {
    switch (steps[currentStep].component) {
      case 'WelcomeStep':
        return <WelcomeStep onNext={nextStep} />
      case 'ClinicStep':
        return <ClinicStep onNext={nextStep} onBack={prevStep} />
      case 'HoursStep':
        return <HoursStep onNext={nextStep} onBack={prevStep} />
      case 'CommunicationStep':
        return <CommunicationStep onNext={nextStep} onBack={prevStep} />
      case 'CompleteStep':
        return <CompleteStep onFinish={nextStep} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Step {currentStep + 1} of {steps.length}</span>
            <span className="text-sm text-gray-600">{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
          </div>
          <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  index <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {index < currentStep ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                {steps[currentStep].icon}
              </div>
              <h2 className="text-2xl font-bold mb-2">{steps[currentStep].title}</h2>
              <p className="text-gray-600">{steps[currentStep].description}</p>
            </div>

            <StepComponent />
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Need help? Chat with us or call +91-98765-43210
          </p>
        </div>
      </div>
    </div>
  )
}