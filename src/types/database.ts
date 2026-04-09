export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Clinic = Database['public']['Tables']['clinics']['Row']
export type Staff = Database['public']['Tables']['staff']['Row']
export type Followup = Database['public']['Tables']['followups']['Row']

export interface Database {
  public: {
    Tables: {
      whatsapp_templates: {
        Row: {
          id: string
          clinic_id: string
          name: string
          category: string
          body_text: string
          variables: string[]
          gupshup_template_id: string | null
          meta_status: string
          created_at: string
          approved_at: string | null
        }
        Insert: {
          id?: string
          clinic_id: string
          name: string
          category?: string
          body_text: string
          variables?: string[]
          gupshup_template_id?: string | null
          meta_status?: string
          created_at?: string
          approved_at?: string | null
        }
        Update: {
          id?: string
          clinic_id?: string
          name?: string
          category?: string
          body_text?: string
          variables?: string[]
          gupshup_template_id?: string | null
          meta_status?: string
          created_at?: string
          approved_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          [key: string]: any
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          [key: string]: any
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          [key: string]: any
        }
        Relationships: []
      }
      clinics: {
        Row: {
          id: string
          name: string
          status: 'active' | 'suspended' | 'offboarded'
          created_at: string
          [key: string]: any
        }
        Insert: {
          id?: string
          name: string
          status?: 'active' | 'suspended' | 'offboarded'
          created_at?: string
          [key: string]: any
        }
        Update: {
          id?: string
          name?: string
          status?: 'active' | 'suspended' | 'offboarded'
          created_at?: string
          [key: string]: any
        }
        Relationships: []
      }
      staff: {
        Row: {
          id: string
          user_id: string
          clinic_id: string
          role: string
          [key: string]: any
        }
        Insert: {
          id?: string
          user_id: string
          clinic_id: string
          role?: string
          [key: string]: any
        }
        Update: {
          id?: string
          user_id?: string
          clinic_id?: string
          role?: string
          [key: string]: any
        }
        Relationships: []
      }
      followups: {
        Row: {
          id: string
          clinic_id: string
          patient_id: string
          status: string
          due_date: string
          type: string
          notes: string | null
          created_at: string
          created_by: string
          sent_at: string | null
          [key: string]: any
        }
        Insert: {
          id?: string
          clinic_id: string
          patient_id: string
          status: string
          due_date: string
          type: string
          notes?: string | null
          created_at?: string
          created_by: string
          sent_at?: string | null
          [key: string]: any
        }
        Update: {
          id?: string
          clinic_id?: string
          patient_id?: string
          status?: string
          due_date?: string
          type?: string
          notes?: string | null
          created_at?: string
          created_by?: string
          sent_at?: string | null
          [key: string]: any
        }
        Relationships: [
          {
            foreignKeyName: "followups_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followups_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          }
        ]
      }
      doctors: {
        Row: {
          id: string
          clinic_id: string
          name: string
          email: string | null
          phone: string | null
          color: string
          created_at: string
          [key: string]: any
        }
        Insert: {
          id?: string
          clinic_id: string
          name: string
          email?: string | null
          phone?: string | null
          color?: string
          created_at?: string
          [key: string]: any
        }
        Update: {
          id?: string
          clinic_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          color?: string
          created_at?: string
          [key: string]: any
        }
        Relationships: []
      }
      services: {
        Row: {
          id: string
          clinic_id: string
          name: string
          duration: number
          price: number
          color: string
          created_at: string
          [key: string]: any
        }
        Insert: {
          id?: string
          clinic_id: string
          name: string
          duration: number
          price: number
          color?: string
          created_at?: string
          [key: string]: any
        }
        Update: {
          id?: string
          clinic_id?: string
          name?: string
          duration?: number
          price?: number
          color?: string
          created_at?: string
          [key: string]: any
        }
        Relationships: []
      }
      patients: {
        Row: {
          id: string
          clinic_id: string
          full_name: string
          phone: string
          email: string | null
          lifecycle_stage: Database["public"]["Enums"]["patient_lifecycle_stage"]
          whatsapp_opt_in: boolean
          has_active_journey: boolean
          last_journey_end_at: string | null
          created_at: string
          [key: string]: any
        }
        Insert: {
          id?: string
          clinic_id: string
          full_name: string
          phone: string
          email?: string | null
          whatsapp_opt_in?: boolean
          has_active_journey?: boolean
          last_journey_end_at?: string | null
          created_at?: string
          [key: string]: any
        }
        Update: {
          id?: string
          clinic_id?: string
          full_name?: string
          phone?: string
          email?: string | null
          whatsapp_opt_in?: boolean
          has_active_journey?: boolean
          last_journey_end_at?: string | null
          created_at?: string
          [key: string]: any
        }
        Relationships: []
      }
      appointments: {
        Row: {
          id: string
          clinic_id: string
          patient_id: string
          doctor_id: string
          service_id: string
          service_type: string | null
          start_time: string
          end_time: string
          status: string
          reminder_sent_24h: boolean
          reminder_sent_2h: boolean
          created_at: string
          [key: string]: any
        }
        Insert: {
          id?: string
          clinic_id: string
          patient_id: string
          doctor_id: string
          service_id: string
          service_type?: string | null
          start_time: string
          end_time: string
          status?: string
          reminder_sent_24h?: boolean
          reminder_sent_2h?: boolean
          created_at?: string
          [key: string]: any
        }
        Update: {
          id?: string
          clinic_id?: string
          patient_id?: string
          doctor_id?: string
          service_id?: string
          service_type?: string | null
          start_time?: string
          end_time?: string
          status?: string
          reminder_sent_24h?: boolean
          reminder_sent_2h?: boolean
          created_at?: string
          [key: string]: any
        }
        Relationships: []
      }
      reminder_logs: {
        Row: {
          id: string
          clinic_id: string
          patient_id: string
          appointment_id: string | null
          type: string
          status: string
          message: string
          error: string | null
          created_at: string
          metadata: Json | null
          [key: string]: any
        }
        Insert: {
          id?: string
          clinic_id: string
          patient_id: string
          appointment_id?: string | null
          type: string
          status: string
          message: string
          error?: string | null
          created_at?: string
          metadata?: Json | null
          [key: string]: any
        }
        Update: {
          id?: string
          clinic_id?: string
          patient_id?: string
          appointment_id?: string | null
          type?: string
          status?: string
          message?: string
          error?: string | null
          created_at?: string
          metadata?: Json | null
          [key: string]: any
        }
        Relationships: []
      }
      reminder_settings: {
        Row: {
          id: string
          clinic_id: string
          enabled: boolean
          whatsapp_template_24h: string | null
          whatsapp_template_2h: string | null
          updated_at: string
          [key: string]: any
        }
        Insert: {
          id?: string
          clinic_id: string
          enabled?: boolean
          whatsapp_template_24h?: string | null
          whatsapp_template_2h?: string | null
          updated_at?: string
          [key: string]: any
        }
        Update: {
          id?: string
          clinic_id?: string
          enabled?: boolean
          whatsapp_template_24h?: string | null
          whatsapp_template_2h?: string | null
          updated_at?: string
          [key: string]: any
        }
        Relationships: []
      }
      patient_recalls: {
        Row: {
          id: string
          clinic_id: string
          patient_id: string
          treatment_category: string
          last_visit_date: string | null
          recall_due_date: string
          status: Database["public"]["Enums"]["recall_status"]
          attempt_count: number
          last_contacted_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          patient_id: string
          treatment_category?: string
          last_visit_date?: string | null
          recall_due_date: string
          status?: Database["public"]["Enums"]["recall_status"]
          attempt_count?: number
          last_contacted_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string
          patient_id?: string
          treatment_category?: string
          last_visit_date?: string | null
          recall_due_date?: string
          status?: Database["public"]["Enums"]["recall_status"]
          attempt_count?: number
          last_contacted_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_recalls_clinic_id_fkey"
            columns: ["clinic_id"]
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_recalls_patient_id_fkey"
            columns: ["patient_id"]
            referencedRelation: "patients"
            referencedColumns: ["id"]
          }
        ]
      }
      recall_activities: {
        Row: {
          id: string
          recall_id: string
          activity_type: Database["public"]["Enums"]["recall_activity_type"]
          performed_by: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recall_id: string
          activity_type: Database["public"]["Enums"]["recall_activity_type"]
          performed_by?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          recall_id?: string
          activity_type?: Database["public"]["Enums"]["recall_activity_type"]
          performed_by?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recall_activities_recall_id_fkey"
            columns: ["recall_id"]
            referencedRelation: "patient_recalls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recall_activities_performed_by_fkey"
            columns: ["performed_by"]
            referencedRelation: "staff"
            referencedColumns: ["id"]
          }
        ]
      }
      leads: {
        Row: {
          id: string
          clinic_id: string
          full_name: string
          phone: string | null
          email: string | null
          source: Database["public"]["Enums"]["lead_source"]
          status: Database["public"]["Enums"]["lead_status"]
          interest: string | null
          notes: string | null
          last_contacted_at: string | null
          next_followup_at: string | null
          converted_patient_id: string | null
          assigned_to: string | null
          is_opted_out: boolean
          followup_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          full_name: string
          phone?: string | null
          email?: string | null
          source: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          interest?: string | null
          notes?: string | null
          last_contacted_at?: string | null
          next_followup_at?: string | null
          converted_patient_id?: string | null
          assigned_to?: string | null
          is_opted_out?: boolean
          followup_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string
          full_name?: string
          phone?: string | null
          email?: string | null
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          interest?: string | null
          notes?: string | null
          last_contacted_at?: string | null
          next_followup_at?: string | null
          converted_patient_id?: string | null
          assigned_to?: string | null
          is_opted_out?: boolean
          followup_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_clinic_id_fkey"
            columns: ["clinic_id"]
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          }
        ]
      }
      lead_activities: {
        Row: {
          id: string
          lead_id: string
          actor_id: string | null
          type: string
          description: string
          created_at: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          lead_id: string
          actor_id?: string | null
          type: string
          description: string
          created_at?: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          lead_id?: string
          actor_id?: string | null
          type?: string
          description?: string
          created_at?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            referencedRelation: "leads"
            referencedColumns: ["id"]
          }
        ]
      }
      journey_templates: {
        Row: {
          id: string
          clinic_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          clinic_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          clinic_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "journey_templates_clinic_id_fkey"
            columns: ["clinic_id"]
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          }
        ]
      }
      journey_stages: {
        Row: {
          id: string
          template_id: string
          name: string
          order_index: number
          type: string
          config: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          template_id: string
          name: string
          order_index: number
          type: string
          config?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          name?: string
          order_index?: number
          type?: string
          config?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_stages_template_id_fkey"
            columns: ["template_id"]
            referencedRelation: "journey_templates"
            referencedColumns: ["id"]
          }
        ]
      }
      patient_journeys: {
        Row: {
          id: string
          clinic_id: string
          patient_id: string
          template_id: string
          current_stage_id: string | null
          status: string
          started_at: string
          completed_at: string | null
          automation_locked: boolean
          automation_locked_at: string | null
          snooze_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          patient_id: string
          template_id: string
          current_stage_id?: string | null
          status?: string
          started_at?: string
          completed_at?: string | null
          automation_locked?: boolean
          automation_locked_at?: string | null
          snooze_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string
          patient_id?: string
          template_id?: string
          current_stage_id?: string | null
          status?: string
          started_at?: string
          completed_at?: string | null
          automation_locked?: boolean
          automation_locked_at?: string | null
          snooze_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_journeys_clinic_id_fkey"
            columns: ["clinic_id"]
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_journeys_patient_id_fkey"
            columns: ["patient_id"]
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_journeys_template_id_fkey"
            columns: ["template_id"]
            referencedRelation: "journey_templates"
            referencedColumns: ["id"]
          }
        ]
      }
      patient_journey_stages: {
        Row: {
          id: string
          journey_id: string
          stage_id: string
          status: string
          started_at: string | null
          completed_at: string | null
          expected_completion_at: string | null
          delay_status: string
          messages_sent_count: number
          last_message_at: string | null
          automation_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          journey_id: string
          stage_id: string
          status?: string
          started_at?: string | null
          completed_at?: string | null
          expected_completion_at?: string | null
          delay_status?: string
          messages_sent_count?: number
          last_message_at?: string | null
          automation_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          journey_id?: string
          stage_id?: string
          status?: string
          started_at?: string | null
          completed_at?: string | null
          expected_completion_at?: string | null
          delay_status?: string
          messages_sent_count?: number
          last_message_at?: string | null
          automation_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_journey_stages_journey_id_fkey"
            columns: ["journey_id"]
            referencedRelation: "patient_journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_journey_stages_stage_id_fkey"
            columns: ["stage_id"]
            referencedRelation: "journey_stages"
            referencedColumns: ["id"]
          }
        ]
      }
      journey_transitions: {
        Row: {
          id: string
          journey_id: string
          from_stage_id: string | null
          to_stage_id: string | null
          action: string
          actor_id: string | null
          meta: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          journey_id: string
          from_stage_id?: string | null
          to_stage_id?: string | null
          action: string
          actor_id?: string | null
          meta?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          journey_id?: string
          from_stage_id?: string | null
          to_stage_id?: string | null
          action?: string
          actor_id?: string | null
          meta?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_transitions_journey_id_fkey"
            columns: ["journey_id"]
            referencedRelation: "patient_journeys"
            referencedColumns: ["id"]
          }
        ]
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      whatsapp_connections: {
        Row: {
          id: string
          clinic_id: string
          session_data: Json
          status: string
          offboarded_at: string | null
          offboarding_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          session_data: Json
          status?: string
          offboarded_at?: string | null
          offboarding_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string
          session_data?: Json
          status?: string
          offboarded_at?: string | null
          offboarding_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_connections_clinic_id_fkey"
            columns: ["clinic_id"]
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      view_stuck_journeys: {
        Row: {
          journey_id: string
          patient_id: string
          clinic_id: string
          stage_id: string
          stage_name: string
          delay_status: string
          days_overdue: number
          patient_name: string
          patient_phone: string
          automation_enabled: boolean
        }
        Relationships: []
      }
    }
    Functions: {
      increment_recall_attempts: {
        Args: {
          recall_id_param: string
        }
        Returns: void
      }
    }
    Enums: {
      patient_lifecycle_stage: 
        | 'new_patient'
        | 'visited'
        | 'treatment_completed'
        | 'recall_due'
        | 'recall_not_responded'
        | 'recall_booked'
        | 'inactive'
        | 'opted_out'
      recall_status:
        | 'pending'
        | 'overdue'
        | 'contacted'
        | 'booked'
        | 'completed'
        | 'cancelled'
      recall_activity_type:
        | 'message_sent'
        | 'staff_call'
        | 'patient_response'
        | 'booking_made'
        | 'opt_out'
      lead_status:
        | 'new'
        | 'contacted'
        | 'responsive'
        | 'booked'
        | 'lost'
        | 'invalid'
      lead_source:
        | 'facebook_ad'
        | 'google_ad'
        | 'website'
        | 'referral'
        | 'manual'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
