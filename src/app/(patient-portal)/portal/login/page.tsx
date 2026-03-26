import { OTPLoginForm } from '@/components/portal/otp-login-form'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-blue-600">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Patient Portal</CardTitle>
          <CardDescription>
            Enter your phone number to access your appointments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OTPLoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
