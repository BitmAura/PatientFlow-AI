export const LEAD_COLUMN_MAPPINGS = [
  { label: 'Full Name', value: 'full_name', required: true, aliases: ['name', 'lead name', 'customer', 'prospect'] },
  { label: 'Phone Number', value: 'phone', required: false, aliases: ['mobile', 'cell', 'contact', 'whatsapp'] },
  { label: 'Email', value: 'email', required: false, aliases: ['mail', 'e-mail'] },
  { label: 'Source', value: 'source', required: false, aliases: ['origin', 'channel', 'campaign'] },
  { label: 'Status', value: 'status', required: false, aliases: ['stage', 'pipeline', 'state'] },
  { label: 'Interest', value: 'interest', required: false, aliases: ['service', 'treatment', 'looking for'] },
  { label: 'Notes', value: 'notes', required: false, aliases: ['comments', 'remarks'] },
]

export function autoDetectLeadMappings(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {}
  
  LEAD_COLUMN_MAPPINGS.forEach((field) => {
    const match = headers.find(header => 
      field.aliases.some(alias => header.toLowerCase().includes(alias)) ||
      header.toLowerCase() === field.label.toLowerCase()
    )
    
    if (match) {
      mapping[field.value] = match
    }
  })
  
  return mapping
}
