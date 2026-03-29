export function getPublicAppUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_APP_URL || 'https://patientflow.ai').trim()
  if (!raw) return 'https://patientflow.ai'

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
  return withProtocol.replace(/\/+$/, '')
}

export function buildBookingLink(clinicIdentifier: string): string {
  const safeIdentifier = encodeURIComponent(clinicIdentifier)
  return `${getPublicAppUrl()}/book/${safeIdentifier}`
}
