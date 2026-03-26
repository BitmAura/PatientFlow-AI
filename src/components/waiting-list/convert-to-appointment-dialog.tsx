"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { convertToAppointmentSchema } from "@/lib/validations/waiting-list"
import { useConvertWaitlistToAppointment } from "@/hooks/use-waiting-list"
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
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { WaitlistEntry } from "@/types/waiting-list"
import { toast } from "sonner"

interface ConvertToAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: WaitlistEntry
}

export function ConvertToAppointmentDialog({ open, onOpenChange, entry }: ConvertToAppointmentDialogProps) {
  const { mutate: convert, isPending } = useConvertWaitlistToAppointment()
  
  const form = useForm({
    resolver: zodResolver(convertToAppointmentSchema),
    defaultValues: {
      date: '',
      time: '',
    }
  })

  const onSubmit = (data: any) => {
    convert({ id: entry.id, data }, {
      onSuccess: () => {
        toast.success("Appointment booked successfully")
        onOpenChange(false)
        form.reset()
      },
      onError: (error) => {
        toast.error(error.message)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convert to Appointment</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium">Patient</label>
                    <div className="text-sm text-muted-foreground">{entry.patient?.full_name}</div>
                </div>
                <div>
                    <label className="text-sm font-medium">Service</label>
                    <div className="text-sm text-muted-foreground">{entry.service?.name}</div>
                </div>
            </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>Book Appointment</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
