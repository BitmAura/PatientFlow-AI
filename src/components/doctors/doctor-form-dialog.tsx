"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createDoctorSchema, CreateDoctorInput } from "@/lib/validations/doctor"
import { useCreateDoctor, useUpdateDoctor } from "@/hooks/use-doctors"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { DoctorPhotoUpload } from "./doctor-photo-upload"
import { toast } from "sonner"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { useClinicStore } from "@/stores/clinic-store"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DoctorFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  doctor?: any // Should be typed properly
}

export function DoctorFormDialog({ open, onOpenChange, doctor }: DoctorFormDialogProps) {
  const isEditing = !!doctor
  const { mutate: create, isPending: isCreating } = useCreateDoctor()
  const { mutate: update, isPending: isUpdating } = useUpdateDoctor()
  const { clinic } = useClinicStore()
  const supabase = createClient() as any

  // Fetch services for selection
  const { data: services } = useQuery({
    queryKey: ['services', clinic?.id],
    queryFn: async () => {
      if (!clinic?.id) return []
      const { data } = await supabase
        .from('services')
        .select('id, name')
        .eq('clinic_id', clinic.id)
        .eq('is_active', true)
      return data || []
    },
    enabled: !!clinic?.id
  })

  const form = useForm<CreateDoctorInput>({
    resolver: zodResolver(createDoctorSchema),
    defaultValues: {
      full_name: doctor?.name || "",
      phone: doctor?.phone || "",
      email: doctor?.staff?.user?.email || "", // Fallback or logic needs review
      specialization: doctor?.specialization || "",
      qualification: doctor?.qualification || "",
      bio: doctor?.bio || "",
      consultation_fee: doctor?.consultation_fee || 0,
      photo_url: doctor?.avatar_url || "",
      service_ids: doctor?.service_ids || [],
      show_on_booking_page: doctor?.is_bookable_online ?? true,
      is_active: doctor ? doctor.staff?.status === 'active' : true
    }
  })

  const onSubmit = (data: CreateDoctorInput) => {
    const handler = isEditing ? update : create
    const payload = isEditing ? { id: doctor.id, data } : data

    // @ts-ignore - Argument types slightly differ but payload matches structure
    handler(payload, {
      onSuccess: () => {
        toast.success(isEditing ? "Doctor updated" : "Doctor added")
        onOpenChange(false)
        if (!isEditing) form.reset()
      },
      onError: (error: any) => {
        toast.error(error.message)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Doctor" : "Add New Doctor"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="photo_url"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <DoctorPhotoUpload 
                      value={field.value} 
                      onChange={field.onChange}
                      name={form.watch("full_name")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="full_name"
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@clinic.com" {...field} />
                    </FormControl>
                    <FormDescription>Used for login invites</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 234 567 890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialization</FormLabel>
                    <FormControl>
                      <Input placeholder="Cardiologist" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="qualification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qualification</FormLabel>
                  <FormControl>
                    <Input placeholder="MBBS, MD" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Short biography..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="consultation_fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Consultation Fee</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="service_ids"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Services Offered</FormLabel>
                    <FormDescription>
                      Select the services this doctor can perform.
                    </FormDescription>
                  </div>
                  <ScrollArea className="h-40 border rounded-md p-4">
                    {(services as any[])?.map((service: any) => (
                      <FormField
                        key={service.id}
                        control={form.control}
                        name="service_ids"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={service.id}
                              className="flex flex-row items-start space-x-3 space-y-0 mb-2"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(service.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), service.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== service.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {service.name}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </ScrollArea>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-4">
                <FormField
                control={form.control}
                name="show_on_booking_page"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FormLabel className="text-base">
                        Show on Booking Page
                        </FormLabel>
                        <FormDescription>
                        Allow patients to select this doctor online.
                        </FormDescription>
                    </div>
                    <FormControl>
                        <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FormLabel className="text-base">
                        Active Status
                        </FormLabel>
                        <FormDescription>
                        Inactive doctors won&apos;t appear in lists.
                        </FormDescription>
                    </div>
                    <FormControl>
                        <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    </FormItem>
                )}
                />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {isEditing ? "Save Changes" : "Add Doctor"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
