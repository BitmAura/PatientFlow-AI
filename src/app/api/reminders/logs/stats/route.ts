import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type MetricSnapshot = {
  sent: number
  delivered: number
  read: number
  responded: number
}

function pct(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0
  return Number(((numerator / denominator) * 100).toFixed(1))
}

function trend(today: number, yesterday: number): number {
  if (yesterday === 0) return today === 0 ? 0 : 100
  return Number((((today - yesterday) / yesterday) * 100).toFixed(1))
}

function hasResponse(metadata: any): boolean {
  if (!metadata || typeof metadata !== 'object') return false
  return Boolean(
    metadata.response ||
      metadata.response_text ||
      metadata.patient_reply ||
      metadata.inbound_message
  )
}

function summarize(logs: any[]): MetricSnapshot {
  const sent = logs.filter((log: any) => ['sent', 'delivered', 'read', 'failed'].includes(log.status)).length
  const delivered = logs.filter((log: any) => ['delivered', 'read'].includes(log.status)).length
  const read = logs.filter((log: any) => log.status === 'read').length
  const responded = logs.filter((log: any) => hasResponse(log.metadata)).length

  return {
    sent,
    delivered,
    read,
    responded: responded || read,
  }
}

export async function GET() {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!staff?.clinic_id) return new NextResponse('Clinic not found', { status: 404 })

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)

  const { data: logs, error } = await supabase
    .from('reminder_logs')
    .select('status, created_at, metadata')
    .eq('clinic_id', staff.clinic_id)
    .gte('created_at', startOfYesterday.toISOString())

  if (error) {
    return new NextResponse('Failed to fetch reminder stats', { status: 500 })
  }

  const safeLogs = logs || []
  const todayLogs = safeLogs.filter((log: any) => new Date(log.created_at) >= startOfToday)
  const yesterdayLogs = safeLogs.filter(
    (log: any) => new Date(log.created_at) >= startOfYesterday && new Date(log.created_at) < startOfToday
  )

  const todayMetrics = summarize(todayLogs)
  const yesterdayMetrics = summarize(yesterdayLogs)

  const todayDeliveryRate = pct(todayMetrics.delivered, todayMetrics.sent)
  const yesterdayDeliveryRate = pct(yesterdayMetrics.delivered, yesterdayMetrics.sent)
  const todayReadRate = pct(todayMetrics.read, todayMetrics.delivered)
  const yesterdayReadRate = pct(yesterdayMetrics.read, yesterdayMetrics.delivered)
  const todayResponseRate = pct(todayMetrics.responded, todayMetrics.sent)
  const yesterdayResponseRate = pct(yesterdayMetrics.responded, yesterdayMetrics.sent)

  const stats = {
    sent_today: todayMetrics.sent,
    delivery_rate: todayDeliveryRate,
    read_rate: todayReadRate,
    response_rate: todayResponseRate,
    trends: {
      sent: trend(todayMetrics.sent, yesterdayMetrics.sent),
      delivery: trend(todayDeliveryRate, yesterdayDeliveryRate),
      read: trend(todayReadRate, yesterdayReadRate),
      response: trend(todayResponseRate, yesterdayResponseRate),
    },
  }

  return NextResponse.json(stats)
}
