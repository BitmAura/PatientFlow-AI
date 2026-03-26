import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
}

const PRESET_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#84cc16', // Lime
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#d946ef', // Fuchsia
  '#f43f5e', // Rose
  '#64748b', // Slate
]

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className={cn(
              "w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2",
              value === color ? "ring-2 ring-offset-2 ring-gray-900" : ""
            )}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
          >
            {value === color && <Check className="w-4 h-4 text-white" />}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Custom:</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-14 p-0 border-0 bg-transparent cursor-pointer"
        />
        <span className="text-xs text-muted-foreground font-mono">{value}</span>
      </div>
    </div>
  )
}
