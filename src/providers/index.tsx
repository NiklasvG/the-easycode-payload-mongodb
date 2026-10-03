'use client'

import { MotionConfig } from 'framer-motion'
import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user"><HeaderThemeProvider>{children}</HeaderThemeProvider></MotionConfig>
    </ThemeProvider>
  )
}
