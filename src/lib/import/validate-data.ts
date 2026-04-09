import { importRowSchema } from '@/lib/validations/patient'
import { z } from 'zod'

export interface ValidationResult {
  row: any
  isValid: boolean
  errors: Record<string, string>
  warnings: Record<string, string>
}

export function validateImportData(data: any[], mappings: Record<string, string>): ValidationResult[] {
  return data.map((rawRow) => {
    const mappedRow: Record<string, any> = {}
    
    // Apply mappings
    Object.entries(mappings).forEach(([targetField, sourceColumn]) => {
      if (sourceColumn && rawRow[sourceColumn] !== undefined) {
        mappedRow[targetField] = rawRow[sourceColumn]
      }
    })

    const errors: Record<string, string> = {}
    const warnings: Record<string, string> = {}

    // Basic required check before Zod (for better error messages)
    if (!mappedRow.full_name) errors.full_name = 'Name is missing'
    if (!mappedRow.phone) errors.phone = 'Phone is missing'

    // 3. Clean & Validate Phone Number (Strict 10-digit Indian format)
    if (mappedRow.phone) {
      const cleaned = String(mappedRow.phone).replace(/[^0-9]/g, '')
      // Remove country code prefix if present (91)
      const finalPhone = cleaned.length === 12 && cleaned.startsWith('91') ? cleaned.substring(2) : cleaned
      
      if (finalPhone.length !== 10) {
        errors.phone = 'Phone must be exactly 10 digits'
      } else {
        mappedRow.phone = finalPhone
      }
    }

    // 4. Internal Duplicate Detection
    const phoneCount = data.filter(r => {
      const p = String(r[mappings.phone] || '').replace(/[^0-9]/g, '')
      const cleanP = p.length === 12 && p.startsWith('91') ? p.substring(2) : p
      return cleanP === mappedRow.phone
    }).length
    
    if (phoneCount > 1) {
      errors.phone = 'Duplicate phone number in file'
    }

    // Attempt Zod Validation
    const result = importRowSchema.safeParse(mappedRow)
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string
        if (!errors[path]) errors[path] = issue.message
      })
    }

    return {
      row: mappedRow,
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    }
  })
}
