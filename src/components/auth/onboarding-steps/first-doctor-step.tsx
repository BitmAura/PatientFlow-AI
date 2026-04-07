'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { ArrowLeft, ArrowRight, SkipForward } from 'lucide-react'

const firstDoctorSchema = z.object({
  doctorName: z.string().min(2, 'Doctor name is required').max(100),
  doctorPhone: z
    .string()
    .regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number'),
  doctorEmail: z.string().email('Enter a valid email').optional().or(z.literal('')),
  qualification: z.string().max(100).optional().or(z.literal('')),
})

type FirstDoctorValues = z.infer<typeof firstDoctorSchema>

interface FirstDoctorStepProps {
  onBack: () => void
  onNext: (data: Record<string, unknown>) => void
  onSkip: () => void
  defaultValues?: Record<string, unknown>
}

export function FirstDoctorStep({ onBack, onNext, onSkip, defaultValues = {} }: FirstDoctorStepProps) {
  const form = useForm<FirstDoctorValues>({
    resolver: zodResolver(firstDoctorSchema),
    defaultValues: {
      doctorName: (defaultValues.doctorName as string) || '',
      doctorPhone: (defaultValues.doctorPhone as string) || '',
      doctorEmail: (defaultValues.doctorEmail as string) || '',
      qualification: (defaultValues.qualification as string) || '',
    },
  })

  const handleSubmit = (data: FirstDoctorValues) => {
    onNext({ doctor: data })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-foreground">Add your first doctor</h3>
          <p className="text-sm text-muted-foreground">
            Patients will see this when booking appointments. You can add more doctors later.
          </p>
        </div>

        <FormField
          control={form.control}
          name="doctorName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Doctor name <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="e.g. Dr. Priya Sharma" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="qualification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Qualification <span className="text-muted-foreground font-normal">(Optional)</span></FormLabel>
              <FormControl>
                <Input placeholder="e.g. BDS, MDS – Orthodontics" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="doctorPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Doctor's mobile <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <div className="flex overflow-hidden rounded-lg border border-input bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <div className="flex items-center gap-1 border-r bg-muted/50 px-2.5">
                      <span className="text-sm">🇮🇳</span>
                      <span className="text-xs font-semibold text-muted-foreground">+91</span>
                    </div>
                    <Input
                      type="tel"
                      inputMode="numeric"
                      placeholder="98765 43210"
                      maxLength={10}
                      className="rounded-none border-0 shadow-none focus-visible:ring-0 text-sm"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="doctorEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Doctor's email <span className="text-muted-foreground font-normal">(Optional)</span></FormLabel>
                <FormControl>
                  <Input type="email" placeholder="doctor@clinic.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between pt-2">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={onSkip}>
              <SkipForward className="mr-1 h-4 w-4" />
              Skip for now
            </Button>
            <Button type="submit" className="gap-2">
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
