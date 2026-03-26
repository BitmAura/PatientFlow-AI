export type WaitlistStatus = 'waiting' | 'notified' | 'booked' | 'expired' | 'cancelled';
export type WaitlistPriority = 'low' | 'medium' | 'high';
export type PreferredTime = 'morning' | 'afternoon' | 'evening';
export type PreferredDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface WaitlistPreferences {
  date_from: string;
  date_to: string;
  times?: PreferredTime[];
  days?: PreferredDay[];
}

export interface WaitlistEntry {
  id: string;
  clinic_id: string;
  patient_id: string;
  service_id: string; // Changed from doctor_id to service_id based on requirements
  preferences: WaitlistPreferences;
  priority: WaitlistPriority;
  notes?: string;
  status: WaitlistStatus;
  notification_expires_at?: string; // ISO timestamp
  created_at: string;
  updated_at?: string;

  // Joined fields
  patient?: {
    id: string;
    full_name: string;
    phone: string;
    email: string;
  };
  service?: {
    id: string;
    name: string;
    duration: number;
  };
}

export interface WaitlistFilters {
  status?: WaitlistStatus;
  service_id?: string;
  page?: number;
  limit?: number;
}

export interface TimeSlot {
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  date: string; // YYYY-MM-DD
}
