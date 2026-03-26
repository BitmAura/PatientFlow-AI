'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { buildMessage } from '@/lib/whatsapp/templates'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface TemplatePreviewProps {
  template: string
}

export function TemplatePreview({ template }: TemplatePreviewProps) {
  const [useAltData, setUseAltData] = React.useState(false)

  const sampleData1 = {
    patient_name: 'John Doe',
    patient_first_name: 'John',
    doctor_name: 'Dr. Smith',
    clinic_name: 'PatientFlow Dental',
    date: 'Oct 24, 2024',
    time: '10:00 AM',
    service: 'Root Canal',
    clinic_address: '123 Health St, NY',
    clinic_phone: '+1 555-0123',
    maps_link: 'maps.google.com/q=...',
    booking_link: 'app.patientflow.ai/book',
    deposit_amount: '$50.00',
    payment_link: 'stripe.com/pay/...'
  }

  const sampleData2 = {
    patient_name: 'Sarah Connor',
    patient_first_name: 'Sarah',
    doctor_name: 'Dr. Jones',
    clinic_name: 'Future Health',
    date: 'Nov 12, 2024',
    time: '2:30 PM',
    service: 'Consultation',
    clinic_address: '456 Cyber Ave, LA',
    clinic_phone: '+1 555-9999',
    maps_link: 'maps.google.com/q=...',
    booking_link: 'app.patientflow.ai/book',
    deposit_amount: '$25.00',
    payment_link: 'stripe.com/pay/...'
  }

  const previewText = buildMessage(template, useAltData ? sampleData2 : sampleData1)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-muted-foreground">Live Preview</h4>
        <div className="flex items-center gap-2">
          <Switch 
            id="sample-data" 
            checked={useAltData} 
            onCheckedChange={setUseAltData}
            className="scale-75" 
          />
          <Label htmlFor="sample-data" className="text-xs">Alt Data</Label>
        </div>
      </div>
      
      {/* Phone Mockup */}
      <div className="relative flex-1 bg-gray-100 rounded-[2rem] border-4 border-gray-800 p-3 shadow-xl max-w-[300px] mx-auto w-full">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-24 bg-gray-800 rounded-b-xl z-10" />
        
        {/* Screen */}
        <div className="bg-[#e5ddd5] h-full w-full rounded-[1.5rem] overflow-hidden flex flex-col relative">
          {/* Header */}
          <div className="bg-[#075e54] h-12 flex items-center px-4 text-white text-xs font-medium z-10">
            <div className="h-6 w-6 bg-white/20 rounded-full mr-2" />
            <div className="flex-1">
              <p>Dr. Smith</p>
              <p className="text-[10px] opacity-80">online</p>
            </div>
          </div>
          
          {/* Chat Area */}
          <div className="flex-1 p-3 overflow-y-auto">
            <div className="bg-white rounded-lg p-2 shadow-sm text-[13px] leading-relaxed relative max-w-[90%] break-words whitespace-pre-wrap">
              {previewText}
              <span className="text-[10px] text-gray-400 absolute bottom-1 right-2">
                10:05 AM
              </span>
            </div>
          </div>

          {/* Input Area (Visual only) */}
          <div className="bg-gray-100 h-10 flex items-center px-2 gap-2">
            <div className="h-6 w-6 bg-gray-300 rounded-full" />
            <div className="flex-1 h-7 bg-white rounded-full" />
            <div className="h-6 w-6 bg-[#128c7e] rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
