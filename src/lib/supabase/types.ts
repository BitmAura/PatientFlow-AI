import { Database } from '@/types/database'

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Common Table Types
export type User = Tables<'users'>
export type Clinic = Tables<'clinics'>
export type Staff = Tables<'staff'>
export type Doctor = Tables<'doctors'>
export type Service = Tables<'services'>
export type Patient = Tables<'patients'>
export type Appointment = Tables<'appointments'>
export type PatientRecall = Tables<'patient_recalls'>
export type RecallActivity = Tables<'recall_activities'>

// Joined Types (Helpers)
export type AppointmentWithPatient = Appointment & {
  patients: Patient
}

export type AppointmentWithDetails = Appointment & {
  patients: Patient
  doctors: Doctor | null
  services: Service | null
}

export type StaffWithUser = Staff & {
  users: User
}
