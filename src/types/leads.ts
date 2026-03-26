import { Database } from '@/types/database';

export type LeadStatus = Database['public']['Enums']['lead_status'];
export type LeadSource = Database['public']['Enums']['lead_source'];

export type Lead = Database['public']['Tables']['leads']['Row'] & {
  followup_count: number;
  next_followup_at?: string | null;
  is_opted_out?: boolean;
};
export type LeadActivity = Database['public']['Tables']['lead_activities']['Row'];
