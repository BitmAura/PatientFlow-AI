import Image from 'next/image'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left Side - Auth Form */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-[40%] lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <Link href="/" className="mb-8 block">
            <h1 className="text-2xl font-bold text-primary">Aura</h1>
          </Link>
          {children}
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden w-full bg-primary lg:block lg:w-[60%] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-900 opacity-90" />
        <div className="relative flex h-full flex-col justify-center px-12 text-white">
          <h2 className="mb-6 text-4xl font-bold leading-tight">
            Reduce No-Shows by 70% with Automated WhatsApp Reminders
          </h2>
          <p className="mb-8 text-lg text-blue-100">
            Join thousands of healthcare professionals who have streamlined their
            practice and recovered lost revenue with our intelligent booking and
            reminder system.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-4">
              {[
                { name: 'Dr. Smith', color: '0D8ABC' },
                { name: 'Dr. Jones', color: '10B981' },
                { name: 'Dr. Patel', color: 'F59E0B' },
                { name: 'Dr. Lee', color: 'EF4444' }
              ].map((doctor, i) => (
                <div key={i} className="relative h-10 w-10 rounded-full border-2 border-primary bg-gray-200 overflow-hidden">
                  <Image
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=${doctor.color}&color=fff&size=128`}
                    alt={doctor.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="text-sm font-medium">
              Trusted by 500+ Clinics
            </p>
          </div>
        </div>
        {/* Abstract shapes or illustration could go here */}
      </div>
    </div>
  )
}
