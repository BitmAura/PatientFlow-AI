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

const firstServiceSchema = z.object({
  serviceName: z.string().min(2, 'Service name is required').max(100),
  servicePrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid price (e.g. 500 or 1500.00)'),
  serviceDuration: z
    .string()
    .regex(/^\d+$/, 'Enter duration in minutes')
    .refine((v) => Number(v) >= 5 && Number(v) <= 480, { message: 'Duration must be 5–480 minutes' }),
})

type FirstServiceValues = z.infer<typeof firstServiceSchema>

interface FirstServiceStepProps {
  onBack: () => void
  onNext: (data: Record<string, unknown>) => void
  onSkip: () => void
  defaultValues?: Record<string, unknown>
}

const QUICK_SERVICES = [
  { name: 'General Consultation', price: '500', duration: '30' },
  { name: 'Dental Cleaning', price: '1500', duration: '45' },
  { name: 'Physiotherapy Session', price: '800', duration: '60' },
  { name: 'Skin Consultation', price: '700', duration: '20' },
  { name: 'Eye Checkup', price: '400', duration: '30' },
]

export function FirstServiceStep({ onBack, onNext, onSkip, defaultValues = {} }: FirstServiceStepProps) {
  const form = useForm<FirstServiceValues>({
    resolver: zodResolver(firstServiceSchema),
    defaultValues: {
      serviceName: (defaultValues.serviceName as string) || '',
      servicePrice: (defaultValues.servicePrice as string) || '',
      serviceDuration: (defaultValues.serviceDuration as string) || '30',
    },
  })

  const handleSubmit = (data: FirstServiceValues) => {
    onNext({ service: data })
  }

  const applyQuickService = (s: { name: string; price: string; duration: string }) => {
    form.setValue('serviceName', s.name)
    form.setValue('servicePrice', s.price)
    form.setValue('serviceDuration', s.duration)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-foreground">Add your first service</h3>
          <p className="text-sm text-muted-foreground">
            This is what patients will book. You can add more services later.
          </p>
        </div>

        {/* Quick-fill chips */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Quick-fill:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_SERVICES.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => applyQuickService(s)}
                className="rounded-full border px-3 py-1 text-xs hover:border-primary hover:text-primary transition-colors"
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <FormField
          control={form.control}
          name="serviceName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service name <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="e.g. Dental Cleaning, Physiotherapy Session" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="servicePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (₹) <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <div className="flex overflow-hidden rounded-lg border border-input bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <div className="flex items-center border-r bg-muted/50 px-2.5">
                      <span className="text-sm font-semibold text-muted-foreground">₹</span>
                    </div>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="500"
                      className="rounded-none border-0 shadow-none focus-visible:ring-0 text-sm"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="serviceDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <div className="flex overflow-hidden rounded-lg border border-input bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="30"
                      className="rounded-none border-0 shadow-none focus-visible:ring-0 text-sm"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                    />
                    <div className="flex items-center border-l bg-muted/50 px-2.5">
                      <span className="text-xs text-muted-foreground">min</span>
                    </div>
                  </div>
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
