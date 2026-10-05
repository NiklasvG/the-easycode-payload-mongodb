import React from 'react'

// Components
import LucideIcon from '@/components/shared/Functional/LucideIcon'
import { LucideIconName } from '@/utilities/lucideIcons'

// Types
import type { Page } from '@/payload-types'
import { RotatingText } from '@/components/shared/Animation/AnimatedText'
import { Media } from '@/components/Media'
import { HeroIcons } from './HeroIcons'

export const TextAnimationHero: React.FC<Page['hero']> = ({
  title,
  description,
  phrases,
  tags,
  icons,
  media,
}) => {
  const imageAspectRatio =
    typeof media === 'object' && media?.width && media.height ? media.width / media.height : 8 / 5
  const desktopImageWidth = Math.ceil(384 * imageAspectRatio)

  return (
    <section
      className="text-animation-hero bg-background w-full h-full py-12 lg:py-24 2xl:pb-32 flex items-start relative"
    >
      <div className="container mx-auto w-full h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="flex flex-col gap-6 lg:gap-10">
            <h1>
              <RotatingText phrases={phrases?.map(({ phrase }) => phrase) ?? []} className="text-accent" />

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
            {media && (
              <div
                className="relative w-full max-w-full sm:h-96 sm:w-auto"
                style={{
                  aspectRatio:
                    typeof media === 'object' && media.width && media.height
                      ? `${media.width} / ${media.height}`
                      : '8 / 5',
                }}
              >
                <Media
                  fill
                  imgClassName="object-contain"
                  size={`(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) min(${desktopImageWidth}px, calc(100vw - 48px)), min(${desktopImageWidth}px, calc(50vw - 32px))`}
                  priority
                  resource={media}
                />
              </div>
            )}

            {icons && (
              <HeroIcons>
                <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%-5rem)] lg:top-auto lg:bottom-24 xl:bottom-28 2xl:bottom-18">
                  <ul className="flex px-1 py-1 bg-n-9/40 backdrop-blur-sm border rounded-2xl">
                    {icons.map((icon, index) => (
                      <li key={index} className="p-5">
                        <LucideIcon icon={icon.icon as LucideIconName} className="size-6" />
                      </li>
                    ))}
                  </ul>
                </div>
              </HeroIcons>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
