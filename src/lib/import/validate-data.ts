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

    // Clean Phone Number (simple)
    if (mappedRow.phone) {
      const cleaned = String(mappedRow.phone).replace(/[^0-9]/g, '')
      if (cleaned.length < 10) {
        errors.phone = 'Invalid phone number format'
      } else {
        mappedRow.phone = cleaned
      }
    }

    // Attempt Zod Validation
    const result = importRowSchema.safeParse(mappedRow)

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string
        errors[path] = issue.message
      })
    }

    // Custom Warnings
    if (!mappedRow.email) warnings.email = 'Email missing (recommended)'
    if (!mappedRow.dob) warnings.dob = 'DOB missing'

    return {
      row: mappedRow,
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    }
  })
}
