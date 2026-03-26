import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-md w-full">
        <div className="text-8xl font-bold text-blue-100 mb-4">404</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-8">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search..." className="pl-9" />
        </div>

        <Button asChild className="w-full gap-2">
          <Link href="/dashboard">
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  )
}
