import { createClient } from '@supabase/supabase-js'
import * as readline from 'readline'

// Load environment variables manually if running as a standalone script
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.')
  console.log('Usage: NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/offboard-clinic.ts')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

async function offboardClinic(clinicId: string) {
  console.log(`\n🚨 OFFBOARDING CLINIC: ${clinicId}`)
  
  // 1. Verify Clinic Exists
  const { data: clinic, error: clinicError } = await supabase
    .from('clinics')
    .select('name, status')
    .eq('id', clinicId)
    .single()

  if (clinicError || !clinic) {
    console.error('❌ Clinic not found:', clinicError?.message)
    return
  }

  console.log(`Found Clinic: ${clinic.name} (Status: ${clinic.status})`)
  
  // Confirmation
  const confirm = await new Promise<string>(resolve => {
    rl.question('Are you sure you want to OFFBOARD this clinic? (yes/no): ', resolve)
  })

  if (confirm.toLowerCase() !== 'yes') {
    console.log('Aborted.')
    return
  }

  // 2. Pause Automation (Update Status)
  console.log('Step 2: Pausing automation...')
  const { error: updateError } = await supabase
    .from('clinics')
    .update({ status: 'offboarded' } as any)
    .eq('id', clinicId)

  if (updateError) {
    console.error('❌ Failed to update status:', updateError.message)
    return
  }
  console.log('✅ Clinic status set to "offboarded"')

  // 3. Cancel Subscription
  console.log('Step 7: Closing billing...')
  // Find active subscription
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id, razorpay_subscription_id')
    .eq('clinic_id', clinicId) // Assuming clinic_id is on subscriptions based on schema, or user_id link
    .eq('status', 'active')
    .single()

  if (sub) {
    console.log(`Found active subscription: ${sub.id}. Marking as cancelled in DB...`)
    // Note: Actual Razorpay cancellation requires API call. This script just updates DB.
    // In a real scenario, you'd import the razorpay lib here.
    await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('id', sub.id)
    console.log('✅ Subscription marked cancelled')
  } else {
    console.log('ℹ️ No active subscription found.')
  }

  // 4. Disconnect WhatsApp
  console.log('Step 4: Disconnecting WhatsApp...')
  await supabase
    .from('whatsapp_connections')
    .update({ 
        status: 'disconnected',
        offboarded_at: new Date().toISOString(),
        offboarding_reason: 'Manual offboarding script'
    } as any)
    .eq('clinic_id', clinicId)
  console.log('✅ WhatsApp disconnected')

  console.log('\n✅ Offboarding Complete.')
}

// Main
rl.question('Enter Clinic ID to offboard: ', (id) => {
  offboardClinic(id.trim()).then(() => {
    rl.close()
    process.exit(0)
  })
})
