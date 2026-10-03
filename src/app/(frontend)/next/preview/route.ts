// src\app\(frontend)\next\preview\route.ts
import type { CollectionSlug, PayloadRequest } from 'payload'
import { getPayload } from 'payload'

import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { connection, NextRequest } from 'next/server'

import configPromise from '@payload-config'

export async function GET(req: NextRequest): Promise<Response> {
	const { searchParams } = new URL(req.url)

	const path = searchParams.get('path')
	const collection = searchParams.get('collection') as CollectionSlug
	const slug = searchParams.get('slug')
	const previewSecret = searchParams.get('previewSecret')

	if (!process.env.PREVIEW_SECRET || previewSecret !== process.env.PREVIEW_SECRET) {
		return new Response('You are not allowed to preview this page', {
			status: 403
		})
	}

	if (!path || !collection || !slug) {
		return new Response('Insufficient search params', { status: 404 })
	}
	if (!['pages', 'posts', 'projects'].includes(collection)) {
		return new Response('Unsupported preview collection', { status: 400 })
	}

	if (!path.startsWith('/') || path.startsWith('//') || /[\\\x00-\x1f\x7f]|%2f|%5c/i.test(path)) {
		return new Response(
			'This endpoint can only be used for relative previews',
			{ status: 500 }
		)
	}

	await connection()
	const payload = await getPayload({ config: configPromise })
	let user

	try {
		user = await payload.auth({
			req: req as unknown as PayloadRequest,
			headers: req.headers
		})
	} catch (error) {
		payload.logger.error(
			{ err: error },
			'Error verifying token for live preview'
		)
		return new Response('You are not allowed to preview this page', {
			status: 403
		})
	}

	const draft = await draftMode()

	if (!user?.user) {
		draft.disable()
		return new Response('You are not allowed to preview this page', {
			status: 403
		})
	}

	// You can add additional checks here to see if the user is allowed to preview this page

	draft.enable()

	redirect(path)
}
