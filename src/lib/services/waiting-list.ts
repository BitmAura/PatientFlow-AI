import { createClient } from '@/lib/supabase/server';
import { AddToWaitlistInput } from '@/lib/validations/waiting-list';
import { TimeSlot, WaitlistEntry, WaitlistFilters } from '@/types/waiting-list';
import { sendWhatsAppMessage } from '@/lib/whatsapp/send-message';
import { addHours, parseISO, isWithinInterval, getDay, isBefore } from 'date-fns';

// Helper to map numeric day to 'mon', 'tue', etc.
const getDayName = (date: Date): string => {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return days[getDay(date)];
};

// Helper to determine time of day
const getTimeOfDay = (time: string): 'morning' | 'afternoon' | 'evening' => {
  const hour = parseInt(time.split(':')[0], 10);
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

export async function getWaitlist(filters?: WaitlistFilters) {
  const supabase = createClient() as any;
  
  let query = supabase
    .from('waiting_list')
    .select(`
      *,
      patient:patients(id, full_name, phone, email),
      service:services(id, name, duration)
    `)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters?.service_id) {
    query = query.eq('service_id', filters.service_id);
  }

  if (filters?.page && filters?.limit) {
    const from = (filters.page - 1) * filters.limit;
    const to = from + filters.limit - 1;
    query = query.range(from, to);
  }

  const { data, error } = await query;
  if (error) throw error;
  
  return data as unknown as WaitlistEntry[];
}

export async function addToWaitlist(data: AddToWaitlistInput) {
  const supabase = createClient() as any;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  const { data: staff } = await supabase.from('staff').select('clinic_id').eq('user_id', user.id).single();
  if (!staff) throw new Error("Staff profile not found");

  const { error } = await supabase.from('waiting_list').insert({
    clinic_id: staff.clinic_id,
    patient_id: data.patient_id,
    service_id: data.service_id,
    preferences: {
      date_from: data.preferred_date_from,
      date_to: data.preferred_date_to,
      times: data.preferred_times,
      days: data.preferred_days
    },
    priority: data.priority,
    notes: data.notes,
    status: 'waiting'
  });

  if (error) throw error;
}

export async function notifyPatient(waitlistId: string, slot: TimeSlot) {
  const supabase = createClient() as any;
  
  // 1. Fetch entry with patient details
  const { data: entry, error: fetchError } = await supabase
    .from('waiting_list')
    .select('*, patient:patients(phone, full_name)')
    .eq('id', waitlistId)
    .single();

  if (fetchError || !entry) throw new Error("Entry not found");

  // 2. Send WhatsApp
  const message = `Hello ${entry.patient.full_name}, a slot has opened up on ${slot.date} at ${slot.start_time}. Please reply within 2 hours to book.`;

  await sendWhatsAppMessage(entry.clinic_id, entry.patient.phone, message, {
    patientId: entry.patient_id,
    type: 'waitlist_notification'
  });

  // 3. Update status
  const { error } = await supabase
    .from('waiting_list')
    .update({
      status: 'notified',
      notification_expires_at: addHours(new Date(), 2).toISOString()
    })
    .eq('id', waitlistId);

  if (error) throw error;
}

export async function convertToAppointment(waitlistId: string, appointmentData: { date: string, time: string }) {
  const supabase = createClient() as any;
  
  // 1. Get waitlist entry
  const { data: entry, error: fetchError } = await supabase
    .from('waiting_list')
    .select('*')
    .eq('id', waitlistId)
    .single();
    
  if (fetchError || !entry) throw new Error("Entry not found");
  
  // 2. Get service duration to calculate end time
  const { data: service } = await supabase
    .from('services')
    .select('duration')
    .eq('id', entry.service_id)
    .single();
    
  if (!service) throw new Error("Service not found");

  const startTime = parseISO(`${appointmentData.date}T${appointmentData.time}`);
  const endTime = new Date(startTime.getTime() + service.duration * 60000);

  // 3. Create appointment
  const { error: appointmentError } = await supabase.from('appointments').insert({
    clinic_id: entry.clinic_id,
    patient_id: entry.patient_id,
    service_id: entry.service_id,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    duration: service.duration,
    status: 'confirmed',
    source: 'dashboard', // or 'waitlist' if enum allows
    internal_notes: 'Converted from waiting list'
  });

  if (appointmentError) throw appointmentError;

  // 4. Update waitlist status
  const { error: updateError } = await supabase
    .from('waiting_list')
    .update({ status: 'booked' })
    .eq('id', waitlistId);

  if (updateError) throw updateError;
}

export async function checkWaitlistForSlot(clinicId: string, slot: TimeSlot) {
  const supabase = createClient() as any;
  
  // Fetch all waiting entries for this clinic (optimize by service_id if slot has one)
  const { data: entries, error } = await supabase
    .from('waiting_list')
    .select(`
      *,
      patient:patients(id, full_name, phone, email),
      service:services(id, name)
    `)
    .eq('clinic_id', clinicId)
    .eq('status', 'waiting');

  if (error) throw error;

  const slotDate = parseISO(slot.date);
  const slotDay = getDayName(slotDate);
  const slotTimeOfDay = getTimeOfDay(slot.start_time);

  // Filter in memory
  const matchingEntries = entries.filter((entry: any) => {
    const prefs = entry.preferences;
    
    // Check date range
    const start = parseISO(prefs.date_from);
    const end = parseISO(prefs.date_to);
    
    if (!isWithinInterval(slotDate, { start, end })) return false;
    
    // Check days
    if (prefs.days && prefs.days.length > 0 && !prefs.days.includes(slotDay)) return false;
    
    // Check times
    if (prefs.times && prefs.times.length > 0 && !prefs.times.includes(slotTimeOfDay)) return false;
    
    return true;
  });

  // Sort by priority and created_at
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  
  return matchingEntries.sort((a: any, b: any) => {
    const pA = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
    const pB = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
    
    if (pA !== pB) return pB - pA; // Higher priority first
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); // Oldest first
  });
}

export async function expireOldNotifications() {
  const supabase = createClient() as any;
  
  const { error } = await supabase
    .from('waiting_list')
    .update({ status: 'expired' })
    .eq('status', 'notified')
    .lt('notification_expires_at', new Date().toISOString());

  if (error) throw error;
}

export async function removeFromWaitlist(id: string) {
    const supabase = createClient() as any;
    const { error } = await supabase
        .from('waiting_list')
        .update({ status: 'cancelled' })
        .eq('id', id);
        
    if (error) throw error;
}
