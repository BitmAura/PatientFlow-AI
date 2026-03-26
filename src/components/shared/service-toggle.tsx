'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Stethoscope, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ServiceToggleProps {
  currentService?: 'noshow'
  className?: string
  floating?: boolean
}

export function ServiceToggle({ currentService = 'noshow', className, floating = false }: ServiceToggleProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const current = {
    id: currentService,
    name: 'PatientFlow AI',
    icon: Stethoscope,
  }

  if (!isClient) {
    return null // Prevent hydration mismatch
  }

  return (
    <div className={`${floating ? 'fixed top-4 right-4 z-50' : ''} ${className || ''}`}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="bg-white/95 backdrop-blur-sm border-zinc-200 shadow-sm hover:shadow-md hover:bg-zinc-50 transition-all duration-200 px-4 py-2 h-10 group"
          >
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-green-50 text-green-600">
                <current.icon className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-sm text-zinc-900">{current.name}</span>
              <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-80 p-0 overflow-hidden shadow-xl border-zinc-200 ring-1 ring-black/5 rounded-xl bg-white" align="end">
          <div className="p-4 bg-zinc-50 border-b border-zinc-100">
            <h3 className="font-semibold text-zinc-900">PatientFlow AI</h3>
            <p className="text-xs text-zinc-600">No-show killer for clinics</p>
          </div>

          <div className="p-3 bg-white">
            <a
              href="https://wa.me/919148868413?text=Hi%2C%20I%20need%20digital%20marketing%20support%20for%20my%20clinic."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 hover:bg-blue-100 transition-colors"
            >
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                <Briefcase className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-900">Digital marketing services</p>
                <p className="text-xs text-zinc-600">Optional support for patient acquisition</p>
              </div>
            </a>
          </div>

          <div className="p-3 bg-zinc-50 border-t border-zinc-100">
            <div className="flex items-center gap-2 text-[11px] text-zinc-600 justify-center font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <span>One account for all your healthcare needs</span>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
