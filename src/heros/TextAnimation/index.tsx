'use client'
import React, { useEffect, useState, useRef } from 'react'

// Libraries
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'

// Components
import LucideIcon from '@/components/shared/Functional/LucideIcon'
import { LucideIconName } from '@/utilities/lucideIcons'

// Types
import type { Page } from '@/payload-types'
import { AnimatedText } from '@/components/shared/Animation/AnimatedText'
import { Media } from '@/components/Media'

export const TextAnimationHero: React.FC<Page['hero']> = ({
  title,
  description,
  phrases,
  tags,
  icons,
  media,
}) => {
  const [index, setIndex] = useState(0)
  const heroRef = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const iconOffset = useTransform(scrollYProgress, [0, 1], [0, 60])

  useEffect(() => {
    const localPhrases = phrases ?? []

    if (localPhrases.length === 0 || reducedMotion) return

    const { length } = localPhrases

    const intervalId = setInterval(() => {
      setIndex((i) => (i + 1) % length)
    }, 3000)

    return () => clearInterval(intervalId)
  }, [phrases, reducedMotion])

  return (
    <section
      ref={heroRef}
      className="bg-background w-full h-full py-12 lg:py-24 2xl:pb-32 flex items-start relative"
    >
      <div className="container mx-auto w-full h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="flex flex-col gap-6 lg:gap-10">
            <h1>
              <AnimatedText text={phrases?.[index]?.phrase || ''} className="text-accent" />

              <span className="block relative z-10 -mt-2">{title}</span>
            </h1>
            <p className="big">{description}</p>
            {tags && (
              <ul className="list list--tag mt-4">
                {tags.map((tag, index) => (
                  <li key={index}>{tag.tag}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="grid place-items-center w-full h-full relative py-16 lg:pt-0">
            <Media
              className=""
              imgClassName="w-full h-auto sm:h-96 sm:w-auto"
              size="(max-width: 639px) calc(100vw - 32px), 384px"
              priority
              resource={media}
            />

            {icons && (
              <motion.div
                style={{ y: reducedMotion ? 0 : iconOffset }}
                initial={reducedMotion ? false : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: reducedMotion ? 0 : 0.8, delay: reducedMotion ? 0 : 0.5 }}
                className="absolute inset-0 pointer-events-none"
              >
                <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%-5rem)] lg:top-auto lg:bottom-24 xl:bottom-28 2xl:bottom-18">
                  <ul className="flex px-1 py-1 bg-n-9/40 backdrop-blur-sm border rounded-2xl">
                    {icons.map((icon, index) => (
                      <li key={index} className="p-5">
                        <LucideIcon icon={icon.icon as LucideIconName} className="size-6" />
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
