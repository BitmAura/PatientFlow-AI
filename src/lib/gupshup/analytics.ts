/**
 * Gupshup Monitoring & Analytics
 * 
 * Tracks:
 * - Message sending success rates
 * - Delivery latency
 * - Error patterns
 * - Rate limit usage
 * - Cost per clinic
 */

import { createClient } from '@supabase/supabase-js'

export interface GupshupMetrics {
  totalMessages: number
  successfulMessages: number
  failedMessages: number
  successRate: number
  averageLatency: number
  costEstimate: number
  rateLimitUsed: number
  errorBreakdown: Record<string, number>
  topErrors: Array<{ error: string; count: number }>
  timeRange: {
    start: Date
    end: Date
  }
}

export interface ClinicGupshupStats {
  clinicId: string
  clinicName: string
  metrics: GupshupMetrics
  topPatients: Array<{
    patientName: string
    messagesCount: number
  }>
  messagesByHour: Array<{
    hour: number
    count: number
  }>
}

/**
 * Get Gupshup metrics for a time period
 */
export async function getGupshupMetrics(
  clinicId: string,
  days: number = 30
): Promise<GupshupMetrics> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Get reminder logs for this clinic
  const { data: logs } = await supabase
    .from('reminder_logs')
    .select('*')
    .eq('clinic_id', clinicId)
    .eq('provider', 'gupshup')
    .gte('created_at', startDate.toISOString())

  if (!logs || logs.length === 0) {
    return {
      totalMessages: 0,
      successfulMessages: 0,
      failedMessages: 0,
      successRate: 0,
      averageLatency: 0,
      costEstimate: 0,
      rateLimitUsed: 0,
      errorBreakdown: {},
      topErrors: [],
      timeRange: { start: startDate, end: new Date() },
    }
  }

  // Analyze logs
  const successful = logs.filter((l) => l.provider_status === 'delivered').length
  const failed = logs.filter((l) => l.provider_status === 'failed').length
  const totalMessages = logs.length
  const successRate = totalMessages > 0 ? (successful / totalMessages) * 100 : 0

  // Calculate latency
  const latencies = logs
    .filter((l) => l.sent_at && l.delivered_at)
    .map((l) => {
      const sent = new Date(l.sent_at).getTime()
      const delivered = new Date(l.delivered_at).getTime()
      return delivered - sent
    })

  const averageLatency =
    latencies.length > 0
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length
      : 0

  // Error breakdown
  const errorBreakdown: Record<string, number> = {}
  logs
    .filter((l) => l.error_message)
    .forEach((l) => {
      const error = l.error_message || 'Unknown'
      errorBreakdown[error] = (errorBreakdown[error] || 0) + 1
    })

  const topErrors = Object.entries(errorBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([error, count]) => ({ error, count }))

  // Cost estimate (₹0.8 per message average)
  const costPerMessage = 0.8
  const costEstimate = totalMessages * costPerMessage

  return {
    totalMessages,
    successfulMessages: successful,
    failedMessages: failed,
    successRate: Math.round(successRate * 100) / 100,
    averageLatency: Math.round(averageLatency),
    costEstimate: Math.round(costEstimate),
    rateLimitUsed: 0, // Placeholder
    errorBreakdown,
    topErrors,
    timeRange: { start: startDate, end: new Date() },
  }
}

/**
 * Get comprehensive stats for a clinic
 */
export async function getClinicGupshupStats(
  clinicId: string,
  days: number = 30
): Promise<ClinicGupshupStats> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const metrics = await getGupshupMetrics(clinicId, days)

  // Get clinic name
  const { data: clinic } = await supabase
    .from('clinics')
    .select('name')
    .eq('id', clinicId)
    .single()

  // Get top patients
  const { data: topPatients } = await supabase
    .from('reminder_logs')
    .select('patient_id, patients(name)')
    .eq('clinic_id', clinicId)
    .eq('provider', 'gupshup')
    .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())

  const patientCounts: Record<string, number> = {}
  const patientNames: Record<string, string> = {}

  topPatients?.forEach((log: any) => {
    const patientId = log.patient_id
    const patientName = log.patients?.name || 'Unknown'
    patientCounts[patientId] = (patientCounts[patientId] || 0) + 1
    patientNames[patientId] = patientName
  })

  const topPatientsList = Object.entries(patientCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([id, count]) => ({
      patientName: patientNames[id] || 'Unknown',
      messagesCount: count,
    }))

  // Messages by hour (today) 
  const { data: todayLogs } = await supabase
    .from('reminder_logs')
    .select('created_at')
    .eq('clinic_id', clinicId)
    .eq('provider', 'gupshup')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

  const messagesByHour = Array(24).fill(0)
  todayLogs?.forEach((log: any) => {
    const hour = new Date(log.created_at).getHours()
    messagesByHour[hour]++
  })

  const messagesByHourList = messagesByHour.map((count, hour) => ({
    hour,
    count,
  }))

  return {
    clinicId,
    clinicName: clinic?.name || 'Unknown',
    metrics,
    topPatients: topPatientsList,
    messagesByHour: messagesByHourList,
  }
}

/**
 * Get system-wide Gupshup stats (admin only)
 */
export async function getSystemGupshupStats(
  days: number = 30
): Promise<{
  totalMessages: number
  successRate: number
  totalCost: number
  topClinics: Array<{
    clinicName: string
    messageCount: number
    successRate: number
  }>
  errorTrends: Array<{
    error: string
    count: number
  }>
}> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Get all reminder logs
  const { data: logs } = await supabase
    .from('reminder_logs')
    .select('clinic_id, provider_status, error_message, clinics(name)')
    .eq('provider', 'gupshup')
    .gte('created_at', startDate.toISOString())

  if (!logs || logs.length === 0) {
    return {
      totalMessages: 0,
      successRate: 0,
      totalCost: 0,
      topClinics: [],
      errorTrends: [],
    }
  }

  // Overall stats
  const totalMessages = logs.length
  const successful = logs.filter((l) => l.provider_status === 'delivered').length
  const successRate = (successful / totalMessages) * 100

  // By clinic
  const clinicStats: Record<
    string,
    { name: string; total: number; successful: number }
  > = {}

  logs.forEach((log: any) => {
    const clinicId = log.clinic_id
    if (!clinicStats[clinicId]) {
      clinicStats[clinicId] = {
        name: log.clinics?.name || 'Unknown',
        total: 0,
        successful: 0,
      }
    }
    clinicStats[clinicId].total++
    if (log.provider_status === 'delivered') {
      clinicStats[clinicId].successful++
    }
  })

  const topClinics = Object.entries(clinicStats)
    .map(([, stats]) => ({
      clinicName: stats.name,
      messageCount: stats.total,
      successRate: (stats.successful / stats.total) * 100,
    }))
    .sort((a, b) => b.messageCount - a.messageCount)
    .slice(0, 10)

  // Error trends
  const errorTrends: Record<string, number> = {}
  logs
    .filter((l: any) => l.error_message)
    .forEach((log: any) => {
      const error = log.error_message || 'Unknown'
      errorTrends[error] = (errorTrends[error] || 0) + 1
    })

  const errorList = Object.entries(errorTrends)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([error, count]) => ({ error, count }))

  const totalCost = totalMessages * 0.8

  return {
    totalMessages,
    successRate: Math.round(successRate * 100) / 100,
    totalCost: Math.round(totalCost),
    topClinics,
    errorTrends: errorList,
  }
}

/**
 * Export metrics as CSV
 */
export async function exportMetricsCSV(
  clinicId: string,
  days: number = 30
): Promise<string> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data: logs } = await supabase
    .from('reminder_logs')
    .select('*')
    .eq('clinic_id', clinicId)
    .eq('provider', 'gupshup')
    .gte('created_at', startDate.toISOString())

  if (!logs) {
    return 'No data'
  }

  // CSV headers
  const headers = [
    'Date',
    'Patient ID',
    'Message ID',
    'Status',
    'Latency (ms)',
    'Error',
  ]

  // CSV rows
  const rows = logs.map((log) => {
    const latency = log.delivered_at
      ? new Date(log.delivered_at).getTime() - new Date(log.sent_at).getTime()
      : 'N/A'

    return [
      new Date(log.created_at).toISOString(),
      log.patient_id || 'N/A',
      log.provider_message_id || 'N/A',
      log.provider_status || 'N/A',
      latency,
      log.error_message || '',
    ]
  })

  // Combine and escape
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((cell) => {
          const cellStr = String(cell)
          if (cellStr.includes(',') || cellStr.includes('"')) {
            return `"${cellStr.replace(/"/g, '""')}"`
          }
          return cellStr
        })
        .join(',')
    ),
  ].join('\n')

  return csv
}

/**
 * Alert if success rate drops below threshold
 */
export async function checkGupshupHealthAlert(
  clinicId: string,
  thresholdPercent: number = 90
): Promise<{
  isAlert: boolean
  successRate: number
  message: string
}> {
  const metrics = await getGupshupMetrics(clinicId, 1) // Last 24 hours

  if (metrics.totalMessages < 10) {
    return {
      isAlert: false,
      successRate: metrics.successRate,
      message: 'Not enough messages to trigger alert',
    }
  }

  if (metrics.successRate < thresholdPercent) {
    return {
      isAlert: true,
      successRate: metrics.successRate,
      message: `Success rate dropped to ${metrics.successRate}% (threshold: ${thresholdPercent}%)`,
    }
  }

  return {
    isAlert: false,
    successRate: metrics.successRate,
    message: 'All good!',
  }
}