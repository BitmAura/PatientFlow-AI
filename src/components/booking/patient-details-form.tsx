import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PatientDetails } from '@/lib/validations/booking'

interface PatientDetailsFormProps {
  data: PatientDetails
  onChange: (data: PatientDetails) => void
}

export function PatientDetailsForm({ data, onChange }: PatientDetailsFormProps) {
  const handleChange = (field: keyof PatientDetails, value: string) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name *</Label>
        <Input 
          id="name" 
          value={data.name} 
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="John Doe"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number *</Label>
        <div className="flex">
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-muted-foreground text-sm">
            +91
          </span>
          <Input 
            id="phone" 
            value={data.phone} 
            onChange={(e) => handleChange('phone', e.target.value)}
            className="rounded-l-none"
            placeholder="9876543210"
            maxLength={10}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email (Optional)</Label>
        <Input 
          id="email" 
          type="email"
          value={data.email} 
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="john@example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes for Doctor (Optional)</Label>
        <Textarea 
          id="notes" 
          value={data.notes} 
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Any specific symptoms or questions?"
        />
      </div>
    </div>
  )
}
