import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://aura-digital-services.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPages = [
    { url: '/', priority: 1.0, changeFrequency: 'weekly' as const },
    { url: '/pricing', priority: 0.9, changeFrequency: 'monthly' as const },
    { url: '/features', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/how-it-works', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/book-demo', priority: 0.9, changeFrequency: 'monthly' as const },
    { url: '/about', priority: 0.6, changeFrequency: 'monthly' as const },
    { url: '/blog', priority: 0.7, changeFrequency: 'weekly' as const },
    // City landing pages — great for local SEO
    { url: '/bangalore', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/mumbai', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/delhi', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
    { url: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
  ]

  const blogPosts = [
    'dental-clinic-operations-mistakes-losing-revenue',
    'roi-calculator-appointment-automation-worth-it',
    'patient-recall-system-best-practices-india',
    'reduce-no-shows-whatsapp-reminders-india',
    'clinic-revenue-recovery-strategies',
  ]

  return [
    ...staticPages.map(page => ({
      url: `${BASE_URL}${page.url}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...blogPosts.map(slug => ({
      url: `${BASE_URL}/blog/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}
