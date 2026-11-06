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
    <section className="text-animation-hero bg-background w-full py-10 sm:py-12 lg:py-6 xl:py-10 flex items-center relative">
      <div className="container mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 lg:items-center">
          <div className="min-w-0 flex flex-col gap-6 lg:gap-8 xl:gap-10">
            <RotatingText
              phrases={phrases?.map(({ phrase }) => phrase) ?? []}
              className="text-accent"
              title={title}
            />
            <p className="big">{description}</p>
            {tags && (
              <ul className="list list--tag mt-4">
                {tags.map((tag, index) => (
                  <li key={index}>{tag.tag}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="min-w-0 grid place-items-center w-full relative pt-6 pb-12 lg:py-0">
            {media && (
              <div
                className="relative w-full max-w-full"
                style={{
                  maxWidth: desktopImageWidth,
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
                <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%-3.5rem)] lg:top-auto lg:-bottom-6">
                  <ul className="flex w-max max-w-[calc(100vw-2rem)] flex-nowrap justify-center px-1 py-1 bg-n-9/40 backdrop-blur-sm border rounded-2xl">
                    {icons.map((icon, index) => (
                      <li
                        key={index}
                        className="min-w-0 flex items-center justify-center px-[min(0.75rem,3vw)] py-3 sm:p-5"
                      >
                        <LucideIcon icon={icon.icon as LucideIconName} className="size-6 max-w-full" />
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
