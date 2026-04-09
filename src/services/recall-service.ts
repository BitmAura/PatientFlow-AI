import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import { PatientRecall, RecallActivity } from '@/lib/supabase/types'
import { Database } from '@/types/database'

type RecallStatus = Database['public']['Enums']['recall_status']
const ATTEMPT_CAP = 3
const ACTIVE_STATUSES: RecallStatus[] = ['pending', 'contacted', 'overdue']
const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

function parseTimeToMinutes(value: string | null | undefined): number | null {
  if (!value) return null
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(value.trim())
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

export class RecallService {
  /**
   * Programmatically enroll a patient in a recall flow
   */
  static async enrollPatient(
    supabase: SupabaseClient, 
    clinicId: string, 
    patientId: string, 
    treatmentCategory: string,
    dueDate: string
  ): Promise<void> {
    const { error } = await supabase
      .from('patient_recalls')
      .upsert({
        clinic_id: clinicId,
        patient_id: patientId,
        treatment_category: treatmentCategory,
        recall_due_date: dueDate,
        status: 'pending',
        attempt_count: 0,
        updated_at: new Date().toISOString()
      } as any, { onConflict: 'patient_id,treatment_category' })

    if (error) throw error

    // Update patient lifecycle
    await supabase.from('patients')
      .update({ lifecycle_stage: 'recall_pending' } as any)
      .eq('id', patientId)
  }

  private static async getClinicAverageServicePrice(clinicId: string): Promise<number> {
    const supabase = createClient() as any
    const { data: services } = await supabase
      .from('services')
      .select('price')
      .eq('clinic_id', clinicId)

    const prices = (services || [])
      .map((service: any) => Number(service.price || 0))
      .filter((price: number) => Number.isFinite(price) && price > 0)

    if (prices.length === 0) return 500
    const sum = prices.reduce((acc: number, price: number) => acc + price, 0)
    return Math.round(sum / prices.length)
  }

  /**
   * Get all recalls for a specific clinic
   */
  static async getRecalls(clinicId: string, status?: RecallStatus) {
    const supabase = createClient() as any
    let query = supabase
      .from('patient_recalls')
      .select(`
        *,
        patients!inner (
          full_name,
          phone,
          email,
          lifecycle_stage,
          has_active_journey,
          last_journey_end_at
        )
      `)
      .eq('clinic_id', clinicId)
      .in('status', ACTIVE_STATUSES)
      .lt('attempt_count', ATTEMPT_CAP)
      .neq('patients.lifecycle_stage', 'opted_out')
      .neq('patients.has_active_journey', true)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query
    if (error) throw error

    // Filter: Journey Cooldown (e.g., 7 days post-journey)
    // We don't want to recall someone immediately after they finished/dropped a journey.
    const JOURNEY_COOLDOWN_DAYS = 7;
    const now = new Date().getTime();
    const cooldownMs = JOURNEY_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

    return data.filter((recall: any) => {
      const patient = recall.patients;
      if (!patient.last_journey_end_at) return true;
      
      const endAt = new Date(patient.last_journey_end_at).getTime();
      return (now - endAt) > cooldownMs;
    });
  }

  /**
   * Check if a phone number has an active recall
   * Used by LeadService to prevent cross-engine spam
   */
  static async hasActiveRecall(clinicId: string, phone: string): Promise<boolean> {
    const supabase = createClient() as any
    
    // Find patient by phone, then check recalls
    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('clinic_id', clinicId)
      .eq('phone', phone)
      .single()

    if (!patient) return false

    const { count: recallCount } = await supabase
      .from('patient_recalls')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .eq('patient_id', patient.id)
      .in('status', ACTIVE_STATUSES)

    return (recallCount || 0) > 0
  }

  /**
   * Log a new activity for a recall (e.g., "Message Sent")
   */
  static async logActivity(recallId: string, type: Database['public']['Enums']['recall_activity_type'], notes?: string, injectedSupabase?: SupabaseClient) {
    const supabase = (injectedSupabase ?? createClient()) as any
    
    // 1. Log the activity
    const { error: logError } = await supabase
      .from('recall_activities')
      .insert({
        recall_id: recallId,
        activity_type: type,
        notes: notes
      } as any) // Type assertion to bypass strict typing issues with generated types
    
    if (logError) throw logError

    // 2. Update the recall's last_contacted_at and attempt_count if applicable
    if (type === 'message_sent' || type === 'staff_call') {
      await (supabase.rpc('increment_recall_attempts', { recall_id_param: recallId }) as any)
    }
  }

  /**
   * Mark a recall as booked
   */
  static async markAsBooked(recallId: string) {
    const supabase = createClient() as any
    const { error } = await supabase
      .from('patient_recalls')
      .update({ status: 'booked' } as any)
      .eq('id', recallId)
    
    if (error) throw error
  }

  /**
   * Get escalation list (Recalls needing manual attention)
   * Criteria: Overdue > 7 days OR Status is 'overdue' and explicitly marked as needing attention
   */
  static async getEscalationList(clinicId: string) {
    const supabase = createClient() as any
    // Calculate date 7 days ago
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    return supabase
      .from('patient_recalls')
      .select(`
        *,
        patients!inner (
          full_name,
          phone,
          email,
          lifecycle_stage
        )
      `)
      .eq('clinic_id', clinicId)
      .neq('patients.lifecycle_stage', 'opted_out')
      // Filter for active recall flows that are stuck
      .in('status', ['overdue', 'contacted']) 
      // Logic: If created > 7 days ago and still pending/overdue
      .lt('created_at', sevenDaysAgo.toISOString())
      .lt('attempt_count', ATTEMPT_CAP)
      .order('recall_due_date', { ascending: true })
  }

  /**
   * Get Owner-Level Summary Metrics
   */
  static async getOwnerMetrics(clinicId: string) {
    const supabase = createClient() as any
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const ninetyDaysAgo = new Date(now)
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
    
    // 1. Total Patients Recalled This Month
    const { count: recalledCount } = await supabase
      .from('patient_recalls')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .gte('created_at', firstDayOfMonth)

    // 2. Appointments Booked from Recall (Conversion)
    const { count: bookedCount } = await supabase
      .from('patient_recalls')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .eq('status', 'booked')
      .gte('updated_at', firstDayOfMonth)

    // 3. Estimated Revenue Recovered based on clinic average service value.
    const avgServicePrice = await this.getClinicAverageServicePrice(clinicId)
    const estimatedRevenue = (bookedCount || 0) * avgServicePrice

    // 4. Critical Overdue (Patients > 90 days overdue)
    const { count: overdueCount } = await supabase
      .from('patient_recalls')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .eq('status', 'overdue')
      .lt('recall_due_date', ninetyDaysAgo.toISOString())

    return {
      recalled_this_month: recalledCount || 0,
      booked_from_recall: bookedCount || 0,
      estimated_recoverable_value: estimatedRevenue,
      revenue_recovered: estimatedRevenue,
      critical_overdue: overdueCount || 0
    }
  }

  /**
   * Handle Opt-Out Keyword
   */
  static async handleOptOut(patientPhone: string) {
    const supabase = createClient() as any
    
    // 1. Find patient
    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('phone', patientPhone)
      .single()
      
    if (!patient) return

    // 2. Mark as Opted Out
    await supabase
      .from('patients')
      .update({ lifecycle_stage: 'opted_out' } as any)
      .eq('id', patient.id)

    // 3. Cancel active recalls
    await supabase
      .from('patient_recalls')
      .update({ status: 'cancelled', notes: 'User replied STOP' } as any)
      .eq('patient_id', patient.id)
      .in('status', ['pending', 'overdue'])
  }

  private static async checkBusinessHours(clinicId: string): Promise<boolean> {
    const supabase = createClient() as any
    const now = new Date()
    const fallbackHour = now.getHours()

    const { data: clinic } = await supabase
      .from('clinics')
      .select('business_hours')
      .eq('id', clinicId)
      .single()

    const businessHours = clinic?.business_hours || null
    if (!businessHours || typeof businessHours !== 'object') {
      return fallbackHour >= 9 && fallbackHour < 19
    }

    const dayName = DAYS[now.getDay()]
    const daySchedule = (businessHours as any)[dayName]
    if (!daySchedule || daySchedule.is_off === true || daySchedule.closed === true) {
      return false
    }

    const start = parseTimeToMinutes(daySchedule.start || daySchedule.open)
    const end = parseTimeToMinutes(daySchedule.end || daySchedule.close)
    if (start === null || end === null || end <= start) {
      return fallbackHour >= 9 && fallbackHour < 19
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    return currentMinutes >= start && currentMinutes < end
  }

  /**
   * Get Daily "Money Leak" List
   * Returns top opportunities for revenue recovery
   */
  static async getMoneyLeakList(clinicId: string) {
    const supabase = createClient() as any
    const avgServicePrice = await this.getClinicAverageServicePrice(clinicId)
    const withinBusinessHours = await this.checkBusinessHours(clinicId)
    
    // Fetch recalls that are overdue
    const { data, error } = await supabase
      .from('patient_recalls')
      .select(`
        *,
        patients!inner (
          full_name,
          phone,
          lifecycle_stage
        )
      `)
      .eq('clinic_id', clinicId)
      .neq('patients.lifecycle_stage', 'opted_out')
      .in('status', ['overdue', 'contacted'])
      .lt('attempt_count', ATTEMPT_CAP)
      // Prioritize: Longest overdue (oldest due_date)
      .order('recall_due_date', { ascending: true })
      .limit(50)

    if (error) throw error

    // Transform for UI
    return data.map((recall: any) => {
      const daysOverdue = Math.floor(
        (new Date().getTime() - new Date((recall as any).recall_due_date).getTime()) / (1000 * 60 * 60 * 24)
      )
      
      return {
        id: (recall as any).id,
        patient_id: (recall as any).patient_id, // Fix: Ensure patient_id is passed
        patient_name: (recall as any).patients.full_name,
        treatment: (recall as any).treatment_category,
        days_overdue: daysOverdue,
        last_visit: null,
        status: (recall as any).status,
        estimated_recoverable_value: avgServicePrice,
        actual_revenue: null,
        action_needed:
          (recall as any).attempt_count > 0 || !withinBusinessHours
            ? 'Manual Call'
            : 'Auto-Message Pending'
      }
    })
  }

  /**
   * Process a manual staff outcome (client-safe; no WhatsApp send)
   */
  static async processStaffOutcome(
    recallId: string, 
    patientId: string,
    outcome: 'booked' | 'not_interested' | 'call_later' | 'wrong_number' | 'opt_out', 
    notes?: string
  ) {
    const supabase = createClient() as any
    
    let newRecallStatus: RecallStatus = 'contacted'
    let newLifecycleStage: Database['public']['Enums']['patient_lifecycle_stage'] | null = null
    let activityType: Database['public']['Enums']['recall_activity_type'] = 'staff_call'
    
    // 1. Determine State Transitions
    switch (outcome) {
      case 'booked':
        newRecallStatus = 'booked'
        newLifecycleStage = 'recall_booked'
        activityType = 'booking_made'
        break
      case 'not_interested':
        newRecallStatus = 'cancelled'
        newLifecycleStage = 'visited' 
        break
      case 'call_later':
        newRecallStatus = 'contacted'
        break
      case 'wrong_number':
        newRecallStatus = 'cancelled'
        newLifecycleStage = 'inactive'
        break
      case 'opt_out':
        newRecallStatus = 'cancelled'
        newLifecycleStage = 'opted_out'
        activityType = 'opt_out'
        break
    }

    // 2. Perform Atomic Updates
    // A. Log Activity & B. Update Recall Status in Parallel
    const updates: Promise<any>[] = [
      this.logActivity(recallId, activityType, `Staff Outcome: ${outcome}. ${notes || ''}`),
      supabase
        .from('patient_recalls')
        .update({ 
          status: newRecallStatus,
          notes: notes ? `[Staff: ${outcome}] ${notes}` : undefined
        } as any)
        .eq('id', recallId)
    ];

    // C. Update Patient Lifecycle (if changed)
    if (newLifecycleStage) {
      updates.push(
        supabase
          .from('patients')
          .update({ lifecycle_stage: newLifecycleStage } as any)
          .eq('id', patientId)
      );
    }

    await Promise.all(updates);
  }
}
