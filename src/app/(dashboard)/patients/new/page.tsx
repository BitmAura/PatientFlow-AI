'use client'

import * as React from 'react'
import { PageContainer } from '@/components/layout/page-container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createPatientSchema } from '@/lib/validations/patient'
import { z } from 'zod'
import { useCreatePatient, useCheckDuplicate } from '@/hooks/use-patients'
import { useUpdateLead } from '@/hooks/use-leads'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export default function NewPatientPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const createPatient = useCreatePatient()
  const checkDuplicate = useCheckDuplicate()
  const { mutate: updateLead } = useUpdateLead()
  
  const form = useForm<z.infer<typeof createPatientSchema>>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      email: '',
      gender: 'prefer_not_to_say',
      whatsapp_opt_in: true,
      email_opt_in: true,
      language: 'en',
      source: 'manual',
      dob: undefined,
      address: '',
      city: '',
      pincode: '',
      blood_group: '',
      allergies: '',
      notes: '',
      is_vip: false,
      requires_deposit: false
    }
  })

  const [duplicateWarning, setDuplicateWarning] = React.useState<string | null>(null)

  React.useEffect(() => {
    const full_name = searchParams.get('full_name')
    const phone = searchParams.get('phone')
    const email = searchParams.get('email')
    
    if (full_name || phone || email) {
      form.reset({
        ...form.getValues(),
        full_name: full_name || '',
        phone: phone || '',
        email: email || '',
      })
    }
  }, [searchParams, form])

  const handlePhoneBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const phone = e.target.value
    if (phone.length >= 10) {
      const result = await checkDuplicate.mutateAsync(phone)
      if (result) {
        setDuplicateWarning(`Patient already exists: ${result.full_name}`)
      } else {
        setDuplicateWarning(null)
      }
    }
  }

  const onSubmit = async (data: any) => {
    try {
      const patient = await createPatient.mutateAsync(data)
      
      // Update Lead if lead_id exists
      const lead_id = searchParams.get('lead_id')
      if (lead_id) {
        updateLead({ 
          id: lead_id, 
          data: { 
            status: 'booked',
            converted_patient_id: patient.id 
          } 
        })
      }

      router.push('/patients')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <PageContainer>
      <Breadcrumbs />
      
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Add New Patient</h1>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input {...form.register('full_name')} placeholder="John Doe" />
                {form.formState.errors.full_name && (
                  <p className="text-xs text-red-500">{form.formState.errors.full_name.message as string}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input 
                  {...form.register('phone')} 
                  placeholder="9876543210" 
                  onBlur={handlePhoneBlur}
                />
                {duplicateWarning && (
                  <p className="text-xs text-amber-600 font-medium">{duplicateWarning}</p>
                )}
                {form.formState.errors.phone && (
                  <p className="text-xs text-red-500">{form.formState.errors.phone.message as string}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input {...form.register('email')} placeholder="john@example.com" type="email" />
              </div>

              <div className="space-y-2">
                <Label>Gender</Label>
                <Select onValueChange={(val: string) => form.setValue('gender', val as any)} defaultValue="prefer_not_to_say">
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 flex flex-col">
                <Label>Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "pl-3 text-left font-normal",
                        !form.watch('dob') && "text-muted-foreground"
                      )}
                    >
                      {form.watch('dob') ? (
                        format(form.watch('dob') as Date, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.watch('dob') as Date | undefined}
                      onSelect={(date) => form.setValue('dob', date)}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Street Address</Label>
                <Input {...form.register('address')} placeholder="123 Main St" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input {...form.register('city')} />
                </div>
                <div className="space-y-2">
                  <Label>Pincode</Label>
                  <Input {...form.register('pincode')} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical */}
          <Card>
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Blood Group</Label>
                  <Select onValueChange={(val: string) => form.setValue('blood_group', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Allergies</Label>
                <Textarea {...form.register('allergies')} placeholder="Peanuts, Penicillin..." />
              </div>
              <div className="space-y-2">
                <Label>Medical Notes</Label>
                <Textarea {...form.register('notes')} placeholder="Any specific conditions or history..." />
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Settings & Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="whatsapp" 
                  checked={form.watch('whatsapp_opt_in')}
                  onCheckedChange={(checked) => form.setValue('whatsapp_opt_in', checked as boolean)}
                />
                <Label htmlFor="whatsapp">Receive WhatsApp Notifications</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="vip" 
                  checked={form.watch('is_vip')}
                  onCheckedChange={(checked) => form.setValue('is_vip', checked as boolean)}
                />
                <Label htmlFor="vip">Mark as VIP</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="deposit" 
                  checked={form.watch('requires_deposit')}
                  onCheckedChange={(checked) => form.setValue('requires_deposit', checked as boolean)}
                />
                <Label htmlFor="deposit">Requires Deposit for Booking</Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={createPatient.isPending}>
              {createPatient.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Patient
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  )
}
