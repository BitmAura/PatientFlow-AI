import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getAllBlogPosts, getBlogPostBySlug } from '@/lib/blog/posts'

type BlogPostPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const resolved = await params
  const post = getBlogPostBySlug(resolved.slug)

  if (!post) {
    return {
      title: 'Article Not Found',
    }
  }

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolved = await params
  const post = getBlogPostBySlug(resolved.slug)

  if (!post) {
    notFound()
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: post.publishedAt,
    description: post.description,
    author: {
      '@type': 'Organization',
      name: 'Aura Digital Services',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Aura Digital Services',
    },
  }

  return (
    <div className="bg-white py-14 md:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <article className="container mx-auto max-w-3xl px-4">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-600">
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>

        <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-emerald-700">
          {post.publishedAt} • {post.readTime}
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">{post.title}</h1>
        <p className="mt-4 text-lg text-slate-600">{post.description}</p>

        <div className="prose prose-slate mt-10 max-w-none">
          {post.content.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  )
}
