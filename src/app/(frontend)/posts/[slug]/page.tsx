import { connection } from 'next/server'
import type { Metadata } from 'next'
import { cache, Suspense } from 'react'
import LoadingContent from '../../loading'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import RichText from '@/components/RichText'
import { PostHero } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import { getPreviewAccess } from '@/utilities/getPreviewAccess'

type Args = { params: Promise<{ slug: string }> }
const getPost = cache(async (slug: string) => {
  await connection()
	const payload = await getPayload({ config })
  const draft = await getPreviewAccess(payload)
  const result = await payload.find({ collection: 'posts', draft, overrideAccess: draft, limit: 1, pagination: false, where: { slug: { equals: slug } } })
  return result.docs[0] || null
})

export default function PostPage(props: Args) {
  return <Suspense fallback={<LoadingContent />}><PostContent {...props} /></Suspense>
}
async function PostContent({ params }: Args) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return <Suspense fallback={<LoadingContent />}><PayloadRedirects url={`/posts/${slug}`} /></Suspense>
  const { isEnabled: draft } = await draftMode()
  return <article>
    <Suspense fallback={null}><PayloadRedirects disableNotFound url={`/posts/${slug}`} /></Suspense>
    {draft && <LivePreviewListener />}
    <PostHero post={post} />
    <RichText className="container py-12" data={post.content} />
  </article>
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  return generateMeta({ doc: await getPost(slug), collection: 'posts' })
}
