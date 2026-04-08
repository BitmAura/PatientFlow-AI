import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPasswordPage() {
  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
        >
          ← Back to home
        </Link>
      </div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Forgot password?</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <div className="grid gap-6">
        <form>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="doctor@clinic.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
              />
            </div>
            <Button className="w-full bg-primary hover:bg-primary-700">
              Send Reset Link
            </Button>
          </div>
        </form>

        <p className="px-8 text-center text-sm text-muted-foreground">
          Remember your password?{' '}
          <Link
            href="/login"
            className="underline underline-offset-4 hover:text-primary"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
