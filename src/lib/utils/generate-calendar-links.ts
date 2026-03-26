export function generateIcsContent(event: any): string {
  const startDate = new Date(event.startDate)
  const endDate = new Date(event.endDate)
  
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PatientFlow AI//Appointment Scheduler//EN
BEGIN:VEVENT
UID:${event.id}@patientflow.ai
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || ''}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`
}

export function generateGoogleCalendarLink(event: any): string {
  const startDate = new Date(event.startDate)
  const endDate = new Date(event.endDate)
  
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const details = {
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
    details: event.description || '',
    location: event.location || '',
  }

  const params = new URLSearchParams(details)
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function generateOutlookCalendarLink(event: any): string {
  const startDate = new Date(event.startDate)
  const endDate = new Date(event.endDate)
  
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const details = {
    subject: event.title,
    startdt: formatDate(startDate),
    enddt: formatDate(endDate),
    body: event.description || '',
    location: event.location || '',
  }

  const params = new URLSearchParams(details)
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
}