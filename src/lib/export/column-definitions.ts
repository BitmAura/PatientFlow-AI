export interface ColumnDefinition {
  key: string
  label: string
  format?: 'string' | 'date' | 'time' | 'currency' | 'number'
  width?: number
}

export const APPOINTMENT_COLUMNS: ColumnDefinition[] = [
  { key: 'date', label: 'Date', format: 'date', width: 15 },
  { key: 'time', label: 'Time', format: 'time', width: 10 },
  { key: 'patient_name', label: 'Patient Name', width: 25 },
  { key: 'patient_phone', label: 'Phone', width: 15 },
  { key: 'service', label: 'Service', width: 20 },
  { key: 'doctor', label: 'Doctor', width: 20 },
  { key: 'status', label: 'Status', width: 15 },
  { key: 'price', label: 'Price', format: 'currency', width: 12 },
  { key: 'deposit_status', label: 'Deposit', width: 12 }
]

export const PATIENT_COLUMNS: ColumnDefinition[] = [
  { key: 'full_name', label: 'Full Name', width: 25 },
  { key: 'phone', label: 'Phone', width: 15 },
  { key: 'email', label: 'Email', width: 25 },
  { key: 'date_of_birth', label: 'DOB', format: 'date', width: 15 },
  { key: 'total_appointments', label: 'Total Visits', format: 'number', width: 12 },
  { key: 'no_show_count', label: 'No Shows', format: 'number', width: 12 },
  { key: 'last_visit', label: 'Last Visit', format: 'date', width: 15 }
]
