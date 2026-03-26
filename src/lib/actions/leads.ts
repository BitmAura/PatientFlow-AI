'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { LeadStatus } from '@/types/leads'
import { LeadService } from '@/services/lead-service'

export async function getLeads(clinicId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })
    
  if (error) {
    console.error('Error fetching leads:', error)
    throw new Error('Failed to fetch leads')
  }
  
  return data
}

export async function createLead(data: any) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  // Now using LeadService with injected server client!
  try {
     const lead = await LeadService.createLead(supabase as any, data.clinicId, data);
     revalidatePath('/leads')
     return lead;
  } catch (error) {
     console.error('Error creating lead via service:', error);
     throw new Error('Failed to create lead');
  }
}

export async function updateLeadStatus(id: string, status: LeadStatus, clinicId: string) {
  const supabase = createClient()

  const { data: lead, error: fetchError } = await supabase
    .from('leads')
    .select('id, clinic_id')
    .eq('id', id)
    .eq('clinic_id', clinicId)
    .single()

  if (fetchError || !lead) {
    throw new Error('Lead not found or access denied')
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    await LeadService.updateStatus(supabase as any, id, status, user?.id, 'Status updated via draggable board')
    revalidatePath('/leads')
    return { success: true }
  } catch (error) {
    console.error('Error updating lead status:', error)
    throw new Error('Failed to update lead status')
  }
}

export async function deleteLead(id: string, clinicId: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id)
    .eq('clinic_id', clinicId)
    
  if (error) {
    console.error('Error deleting lead:', error)
    throw new Error('Failed to delete lead')
  }
  
  revalidatePath('/leads')
  return { success: true }
}
