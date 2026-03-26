'use client'

import * as React from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface PasswordStrengthProps {
  password?: string
}

export function PasswordStrength({ password = '' }: PasswordStrengthProps) {
  const [strength, setStrength] = React.useState(0)
  const [requirements, setRequirements] = React.useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  })

  React.useEffect(() => {
    const reqs = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
    }
    
    setRequirements(reqs)
    
    setStrength(Object.values(reqs).filter(Boolean).length)
  }, [password])

  const getStrengthColor = (s: number) => {
    if (s === 0) return 'bg-gray-200'
    if (s < 2) return 'bg-red-500'
    if (s < 4) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStrengthLabel = (s: number) => {
    if (s === 0) return 'Enter password'
    if (s < 2) return 'Weak'
    if (s < 4) return 'Medium'
    return 'Strong'
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1 h-1.5 w-full">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              'h-full rounded-full flex-1 transition-all duration-300',
              i <= strength ? getStrengthColor(strength) : 'bg-gray-200'
            )}
          />
        ))}
      </div>
      
      <p className="text-xs font-medium text-gray-500">
        Strength: <span className={cn(
          'font-semibold',
          strength < 2 ? 'text-red-500' : strength < 4 ? 'text-yellow-500' : 'text-green-500'
        )}>{getStrengthLabel(strength)}</span>
      </p>

      <ul className="space-y-1">
        <Requirement label="At least 8 characters" met={requirements.length} />
        <Requirement label="One uppercase letter" met={requirements.uppercase} />
        <Requirement label="One lowercase letter" met={requirements.lowercase} />
        <Requirement label="One number" met={requirements.number} />
      </ul>
    </div>
  )
}

function Requirement({ label, met }: { label: string; met: boolean }) {
  return (
    <li className="flex items-center gap-2 text-xs">
      {met ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <X className="h-3.5 w-3.5 text-gray-400" />
      )}
      <span className={met ? 'text-gray-700' : 'text-gray-500'}>{label}</span>
    </li>
  )
}
