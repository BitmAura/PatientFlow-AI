'use client'

import { LoginForm } from '@/components/auth/login-form'
import { SocialAuthButtons } from '@/components/auth/social-auth-buttons'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { motion } from 'framer-motion'

export default function LoginPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto w-full max-w-lg"
    >
      <GlassCard className="p-8 md:p-10">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            New to Aura Recall?{' '}
            <Link
              href="/signup"
              className="font-medium text-primary transition-colors hover:text-primary/90 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Create an account
            </Link>
          </p>
        </div>

        <div className="space-y-6">
          <LoginForm />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground dark:bg-black">
                Or continue with
              </span>
            </div>
          </div>

          <SocialAuthButtons />
        </div>
      </GlassCard>
    </motion.div>
  )
}
