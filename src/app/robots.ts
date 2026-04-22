import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://patientflow.ai'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Keep dashboard, API routes, and portal private from crawlers
        disallow: [
          '/dashboard',
          '/appointments',
          '/patients',
          '/reports',
          '/settings',
          '/campaigns',
          '/leads',
          '/recalls',
          '/journeys',
          '/reminders',
          '/followups',
          '/waiting-list',
          '/services',
          '/notifications',
          '/portal',
          '/onboarding',
          '/api/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
