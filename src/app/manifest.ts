import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PatientFlow AI',
    short_name: 'PatientFlow AI',
    description: 'Increase Patient Bookings. Reduce No-Shows. Automatically.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1e3a8a',
    icons: [
      {
        src: '/icon.png', // Fallback
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.png', // Fallback
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
