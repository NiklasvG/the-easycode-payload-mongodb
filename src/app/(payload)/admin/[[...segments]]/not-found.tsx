import { connection } from 'next/server'
import { Suspense } from 'react'
/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import type { Metadata } from 'next'

import config from '@payload-config'
import { NotFoundPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap'

type Args = {
  params: Promise<{
    segments: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

export const generateMetadata = async ({ params, searchParams }: Args): Promise<Metadata> => {
  await connection()
  return generatePageMetadata({ config, params, searchParams })
}

const NotFound = (props: Args) => <Suspense fallback={null}><RuntimePage {...props} /></Suspense>
async function RuntimePage({ params, searchParams }: Args) {
  await connection()
  return NotFoundPage({ config, params, searchParams, importMap })
}

export default NotFound
