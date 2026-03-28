import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getAllBlogPosts } from '@/lib/blog/posts'

export const metadata: Metadata = {
  title: 'Clinic Growth Blog',
  description:
    'Guides for Indian dental and skin clinics on no-show reduction, WhatsApp automation, patient recall, and appointment ROI.',
}

export default function BlogIndexPage() {
  const posts = getAllBlogPosts()

  return (
    <div className="bg-white py-14 md:py-20">
      <div className="container mx-auto max-w-5xl px-4">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">PatientFlow AI Blog</h1>
        <p className="mt-4 max-w-3xl text-slate-600">
          Practical growth and operations playbooks for Indian clinics using WhatsApp to reduce no-shows and recover revenue.
        </p>

        <div className="mt-10 grid gap-5">
          {posts.map((post) => (
            <article key={post.slug} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                {post.publishedAt} • {post.readTime}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{post.title}</h2>
              <p className="mt-3 text-slate-600">{post.description}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-600"
              >
                Read article
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
