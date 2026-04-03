'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupSchema } from '@/lib/validations/auth'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { GlowButton } from '@/components/ui/glow-button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Loader2, Eye, EyeOff, User, Building2, Mail, Lock, Phone } from 'lucide-react'
import * as z from 'zod'
import { PasswordStrength } from './password-strength'
import Link from 'next/link'
import { FREE_TRIAL_DAYS, normalizePlanId } from '@/lib/billing/plans'

type SignupFormValues = z.infer<typeof signupSchema>

interface SignupFormProps {
  selectedPlan?: string
}

export function SignupForm({ selectedPlan = 'starter' }: SignupFormProps) {
  const { signUp, loading } = useAuth()
  const normalizedPlan = normalizePlanId(selectedPlan)
  const [showPassword, setShowPassword] = React.useState(false)

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', clinicName: '', email: '', password: '', phone: '', terms: false },
  })

  const password = form.watch('password')

  async function onSubmit(data: SignupFormValues) {
    await signUp(data.email, data.password, data.fullName, {
      phone: data.phone,
      clinicName: data.clinicName,
      selectedPlan: normalizedPlan,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {/* Full name */}
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Your full name</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Dr. Priya Sharma" className="pl-9" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Clinic name */}
        <FormField
          control={form.control}
          name="clinicName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Clinic / Practice name</FormLabel>
              <FormControl>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Sunshine Dental Care" className="pl-9" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Email address</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="email" placeholder="doctor@clinic.com" className="pl-9" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone with +91 prefix */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Mobile number</FormLabel>
              <FormControl>
                <div className="flex overflow-hidden rounded-lg border border-input bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <div className="flex items-center gap-1.5 border-r bg-muted/50 px-3">
                    <span>🇮🇳</span>
                    <span className="text-sm font-semibold text-muted-foreground">+91</span>
                  </div>
                  <Input
                    type="tel"
                    inputMode="numeric"
                    placeholder="98765 43210"
                    maxLength={10}
                    className="rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </FormControl>
              <p className="text-[11px] text-muted-foreground">Used for account security only. Not shared.</p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    className="pl-9 pr-10"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <PasswordStrength password={password} />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Terms */}
        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start gap-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-0.5"
                />
              </FormControl>
              <FormLabel className="text-sm font-normal leading-relaxed cursor-pointer">
                I agree to the{' '}
                <Link href="/terms" className="text-primary hover:underline" target="_blank">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-primary hover:underline" target="_blank">Privacy Policy</Link>
              </FormLabel>
            </FormItem>
          )}
        />

        <GlowButton type="submit" className="w-full" disabled={loading}>
          {loading
            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account…</>
            : `Start ${FREE_TRIAL_DAYS}-Day Free Trial`
          }
        </GlowButton>

        {/* Trust row */}
        <div className="rounded-lg border border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Your data is protected</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
            <span>🔒 256-bit encryption</span>
            <span>🏥 HIPAA-ready infrastructure</span>
            <span>🚫 No data selling, ever</span>
            <span>🗑️ Delete anytime</span>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          No credit card required. Full access for {FREE_TRIAL_DAYS} days, then {normalizedPlan} plan pricing applies.
        </p>
      </form>
    </Form>
  )
}
