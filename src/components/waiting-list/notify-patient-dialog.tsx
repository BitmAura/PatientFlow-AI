"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { notifyPatientSchema } from "@/lib/validations/waiting-list"
import { useNotifyWaitlistPatient } from "@/hooks/use-waiting-list"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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

interface NotifyPatientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: WaitlistEntry
}

export function NotifyPatientDialog({ open, onOpenChange, entry }: NotifyPatientDialogProps) {
  const { mutate: notify, isPending } = useNotifyWaitlistPatient()
  
  const form = useForm({
    resolver: zodResolver(notifyPatientSchema),
    defaultValues: {
      available_date: '',
      available_time: '',
    }
  })

  const onSubmit = (data: any) => {
    notify({ id: entry.id, slot: data }, {
      onSuccess: () => {
        toast.success("Patient notified via WhatsApp")
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
          <DialogTitle>Notify Patient</DialogTitle>
          <DialogDescription>
            Send a WhatsApp notification to {entry.patient?.full_name} about an available slot.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="available_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="available_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted p-3 rounded-md text-sm">
              <p className="font-medium mb-1">Message Preview:</p>
              <p className="text-muted-foreground">
                Hello {entry.patient?.full_name}, a slot has opened up on [Date] at [Time]. Please reply within 2 hours to book.
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>Notify Patient</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
