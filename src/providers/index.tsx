'use client'

import { LazyMotion, MotionConfig } from 'framer-motion'
import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'

const loadMotionFeatures = () => import('./MotionFeatures').then((module) => module.default)

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <LazyMotion features={loadMotionFeatures}>
        <MotionConfig reducedMotion="user"><HeaderThemeProvider>{children}</HeaderThemeProvider></MotionConfig>
      </LazyMotion>
    </ThemeProvider>
  )
}
