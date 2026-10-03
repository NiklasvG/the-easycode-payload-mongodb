/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import '@payloadcms/next/css'
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import React, { Suspense } from 'react'
import { connection } from 'next/server'

import { importMap } from './admin/importMap.js'
import './custom.scss'

// The private Admin is intentionally request-bound, not an instant public route.
export const instant = false

type Args = {
  children: React.ReactNode
}

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

const Layout = ({ children }: Args) => <Suspense fallback={null}><RuntimeLayout>{children}</RuntimeLayout></Suspense>

async function RuntimeLayout({ children }: Args) {
  // Payload initializes request timings before its own cookie access.
  await connection()
  return <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
}

export default Layout
