import * as React from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils/cn'

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
}

export function OTPInput({ length = 6, value, onChange, onComplete }: OTPInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return

    const newValue = value.split('')
    newValue[index] = char
    const newString = newValue.join('')
    
    onChange(newString)

    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    if (newString.length === length) {
      onComplete?.(newString)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, length)
    if (/^\d+$/.test(pastedData)) {
      onChange(pastedData)
      if (pastedData.length === length) {
        onComplete?.(pastedData)
      }
    }
  }

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, i) => (
        <Input
          key={i}
          ref={el => { inputRefs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-12 h-12 text-center text-xl font-bold"
        />
      ))}
    </div>
  )
}
