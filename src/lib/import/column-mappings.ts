export const COLUMN_MAPPINGS = [
  { label: 'Full Name', value: 'full_name', required: true, aliases: ['name', 'patient name', 'customer'] },
  { label: 'Phone Number', value: 'phone', required: true, aliases: ['mobile', 'cell', 'contact'] },
  { label: 'Email', value: 'email', required: false, aliases: ['mail', 'e-mail'] },
  { label: 'Date of Birth', value: 'dob', required: false, aliases: ['birthday', 'birth date'] },
  { label: 'Gender', value: 'gender', required: false, aliases: ['sex'] },
  { label: 'Address', value: 'address', required: false, aliases: ['street', 'location'] },
  { label: 'City', value: 'city', required: false, aliases: ['town'] },
  { label: 'Total Visits', value: 'total_visits', required: false, aliases: ['visits', 'appointments count'] },
  { label: 'No Shows', value: 'no_shows', required: false, aliases: ['missed', 'noshows'] },
  { label: 'Tags', value: 'tags', required: false, aliases: ['labels', 'groups'] },
  { label: 'Notes', value: 'notes', required: false, aliases: ['comments', 'medical notes'] },
]

export function autoDetectMappings(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {}
  
  COLUMN_MAPPINGS.forEach((field) => {
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
