'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clinicDetailsSchema } from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import * as z from 'zod'
import { ArrowRight, Lock } from 'lucide-react'

type ClinicDetailsValues = z.infer<typeof clinicDetailsSchema>

interface ClinicDetailsStepProps {
  defaultValues?: Partial<ClinicDetailsValues>
  onNext: (data: ClinicDetailsValues) => void
}

const SPECIALTIES = [
  { value: 'dental', label: '🦷 Dental / Orthodontics' },
  { value: 'dermatology', label: '🧴 Dermatology / Skin' },
  { value: 'orthopaedics', label: '🦴 Orthopaedics / Physiotherapy' },
  { value: 'gynaecology', label: '👶 Gynaecology / Obstetrics' },
  { value: 'general', label: '🏥 General Medicine' },
  { value: 'paediatrics', label: '🍼 Paediatrics' },
  { value: 'ophthalmology', label: '👁️ Ophthalmology / Eye Care' },
  { value: 'ent', label: '👂 ENT' },
  { value: 'cardiology', label: '❤️ Cardiology' },
  { value: 'psychiatry', label: '🧠 Psychiatry / Mental Health' },
  { value: 'ayurveda', label: '🌿 Ayurveda / Homeopathy' },
  { value: 'other', label: '🔬 Other / Multi-speciality' },
]

export function ClinicDetailsStep({ defaultValues, onNext }: ClinicDetailsStepProps) {
  const form = useForm<ClinicDetailsValues>({
    resolver: zodResolver(clinicDetailsSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      description: defaultValues?.description || '',
      phone: defaultValues?.phone || '',
      email: defaultValues?.email || '',
      website: defaultValues?.website || '',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="space-y-5">

        {/* Intro */}
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-foreground">Tell us about your clinic</h3>
          <p className="text-sm text-muted-foreground">
            This appears on your booking page and patient messages.
          </p>
        </div>

        {/* Clinic name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Clinic name <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="e.g. Sunshine Dental, Apollo Skin Clinic" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Specialty */}
        <FormItem>
          <FormLabel>Speciality</FormLabel>
          <Select onValueChange={() => {}} defaultValue="">
            <SelectTrigger>
              <SelectValue placeholder="Select your speciality…" />
            </SelectTrigger>
            <SelectContent>
              {SPECIALTIES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">Helps us personalise recall message templates for your patients.</p>
        </FormItem>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short description <span className="text-muted-foreground font-normal">(Optional)</span></FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g. A trusted family dental practice serving patients since 2010"
                  className="resize-none"
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone + Email */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Clinic phone <span className="text-red-500">*</span></FormLabel>
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Clinic email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="contact@clinic.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Website */}
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website <span className="text-muted-foreground font-normal">(Optional)</span></FormLabel>
              <FormControl>
                <Input placeholder="https://yourclinic.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Data privacy assurance */}
        <div className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            <strong className="text-slate-700 dark:text-slate-300">Your data stays yours.</strong>{' '}
            All clinic and patient data is encrypted, stored in India, and never shared with third parties.
            You can export or delete your data at any time.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" className="gap-2">
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  )
}
