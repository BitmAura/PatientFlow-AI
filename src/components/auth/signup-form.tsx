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
import { Loader2 } from 'lucide-react'
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

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      clinicName: '',
      email: '',
      password: '',
      phone: '',
      terms: false,
    },
  })

  const password = form.watch('password')

  async function onSubmit(data: SignupFormValues) {
    // Pass selected plan to signup for later use
    await signUp(data.email, data.password, data.fullName, {
      phone: data.phone,
      clinicName: data.clinicName,
      selectedPlan: normalizedPlan,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Dr. John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clinicName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Clinic/Practice Name</FormLabel>
              <FormControl>
                <Input placeholder="ABC Dental Clinic" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="doctor@clinic.com"
                  type="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="+91 9876543210" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <PasswordStrength password={password} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I accept the{' '}
                  <Link href="/terms" className="text-primary hover:underline">
                    terms and conditions
                  </Link>
                </FormLabel>
              </div>
            </FormItem>
          )}
        />

        <GlowButton type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Start {FREE_TRIAL_DAYS}-Day Free Trial
        </GlowButton>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          By creating an account, you agree to start your {normalizedPlan} plan
          trial. You will not be charged until after your {FREE_TRIAL_DAYS}-day trial period
          ends.
        </p>
      </form>
    </Form>
  )
}
