'use client'

import * as React from 'react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { COLUMN_MAPPINGS, autoDetectMappings } from '@/lib/import/column-mappings'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ImportColumnMappingProps {
  headers: string[]
  sampleData: any[]
  mappings: Record<string, string>
  onMappingChange: (mappings: Record<string, string>) => void
}

export function ImportColumnMapping({ 
  headers, 
  sampleData, 
  mappings, 
  onMappingChange 
}: ImportColumnMappingProps) {
  
  // Auto-detect on mount
  React.useEffect(() => {
    const detected = autoDetectMappings(headers)
    onMappingChange(detected)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Run once

  const handleMap = (field: string, header: string) => {
    onMappingChange({ ...mappings, [field]: header })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {COLUMN_MAPPINGS.map((field) => {
          const selectedHeader = mappings[field.value]
          const sampleValue = selectedHeader 
            ? sampleData[0]?.[selectedHeader] 
            : null

          return (
            <Card key={field.value} className={field.required && !selectedHeader ? "border-red-200 bg-red-50/50" : ""}>
              <CardContent className="p-4 grid md:grid-cols-3 gap-4 items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <Label className="font-medium text-base">{field.label}</Label>
                    {field.required && <Badge variant="destructive" className="text-[10px] h-5">Required</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Map to column in your file
                  </p>
                </div>

                <Select
                  value={selectedHeader || "ignore"}
                  onValueChange={(val) => handleMap(field.value, val === "ignore" ? "" : val)}
                >
                  <SelectTrigger className={!selectedHeader && field.required ? "border-red-300" : ""}>
                    <SelectValue placeholder="Select column..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ignore">-- Ignore --</SelectItem>
                    {headers.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded truncate">
                  <span className="font-mono text-xs text-muted-foreground/70 mr-2">Sample:</span>
                  {sampleValue ? String(sampleValue) : <span className="italic">No data</span>}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
