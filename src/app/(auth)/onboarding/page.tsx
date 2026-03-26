import { OnboardingWizard } from '@/components/auth/onboarding-wizard'

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="border-b bg-white px-4 py-4 shadow-sm sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-xl font-bold text-primary">PatientFlow AI</h1>
          <span className="text-sm text-muted-foreground">Account Setup</span>
        </div>
      </div>
      <OnboardingWizard />
    </div>
  )
}
