// Supabase Edge Function: process-recall-eligibility
// Triggered via Cron (e.g., every day at 02:00 UTC)

import { createClient } from '@supabase/supabase-js'

// Configuration for Recall Windows (in Days)
const RECALL_WINDOWS = {
  routine: 90,
  dental: 180
}

export async function serve(req: Request) {
  try {
    // 1. Initialize Supabase Client with Service Role Key (Admin Access)
    // We need admin access to read all patients and update records without RLS restrictions for the system job
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const results = {
      processed: 0,
      new_recalls: 0,
      errors: [] as string[]
    }

    // 2. Process each treatment category
    for (const [category, days] of Object.entries(RECALL_WINDOWS)) {
      
      // Calculate the cutoff date: e.g., "Any visit BEFORE (Today - 90 days)"
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)
      const cutoffDateStr = cutoffDate.toISOString().split('T')[0] // YYYY-MM-DD

      console.log(`Processing ${category} recalls. Cutoff: ${cutoffDateStr}`)

      // 3. Call the Database RPC function to perform the atomic "Find & Insert" logic
      // This is much faster than fetching 10,000 patients to the Edge Function
      const { data, error } = await supabase.rpc('process_daily_recalls', {
        treatment_category_param: category,
        cutoff_date_param: cutoffDateStr
      })

      if (error) {
        console.error(`Error processing ${category}:`, error)
        results.errors.push(`${category}: ${error.message}`)
      } else {
        results.new_recalls += (data as number) || 0
      }
    }

    // 4. Return summary
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Recall eligibility processing complete", 
        data: results 
      }),
      { headers: { "Content-Type": "application/json" } }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
