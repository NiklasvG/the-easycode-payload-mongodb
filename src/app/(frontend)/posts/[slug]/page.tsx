import type { Metadata } from 'next'
import { cache } from 'react'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import RichText from '@/components/RichText'
import { PostHero } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import { getPreviewAccess } from '@/utilities/getPreviewAccess'
import { StructuredData } from '@/components/StructuredData'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { getContentBreadcrumbs, getContentStructuredData } from '@/utilities/structuredData'
import { RelatedPosts } from '@/blocks/RelatedPosts/Component'

type Args = { params: Promise<{ slug: string }> }
const getPost = cache(async (slug: string) => {
	const payload = await getPayload({ config })
  const draft = await getPreviewAccess(payload)
  const result = await payload.find({ collection: 'posts', draft, overrideAccess: draft, limit: 1, pagination: false, where: { slug: { equals: slug } } })
  return result.docs[0] || null
})

export default async function PostPage({ params }: Args) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return <PayloadRedirects url={`/posts/${slug}`} />
  const { isEnabled: draft } = await draftMode()
  return <article>
    <PayloadRedirects disableNotFound url={`/posts/${slug}`} />
    {draft && <LivePreviewListener />}
    <PostHero post={post} />
    {!draft && <StructuredData data={getContentStructuredData(post, 'posts')} />}
    <Breadcrumbs items={getContentBreadcrumbs(post, 'posts')} />
    <RichText className="container py-12" data={post.content} />
    {post.relatedPosts?.some(item => typeof item === 'object') && <section className="container pb-12">
      <h2 className="mb-6 text-2xl">Weiterführende Artikel</h2>
      <RelatedPosts docs={post.relatedPosts.filter((item): item is typeof post => typeof item === 'object')} />
    </section>}
  </article>
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const { isEnabled: preview } = await draftMode()
  return generateMeta({ doc: await getPost(slug), collection: 'posts', preview })
}

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts', draft: false, overrideAccess: false,
    pagination: false, depth: 0, select: { slug: true },
    where: { _status: { equals: 'published' } },
  })
  return docs.map(({ slug }) => ({ slug }))
}
