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

type Args = { params: Promise<{ slug: string }> }
const getPost = cache(async (slug: string) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config })
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
    <RichText className="container py-12" data={post.content} />
  </article>
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  return generateMeta({ doc: await getPost(slug) })
}
