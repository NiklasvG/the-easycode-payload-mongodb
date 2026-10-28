import React from 'react'
import type { FAQBlock } from '@/payload-types'
import { ChevronDown } from 'lucide-react'
import RichText from '@/components/RichText'

type Props = FAQBlock & {
  className?: string
  id?: string
}

export const FAQBlockComponent: React.FC<Props> = ({
  overline,
  headline,
  intro,
  items,
  backgroundVariant = 'primary',
  className,
  id,
}) => {
  if (!items || items.length === 0) return null

  const bgClass = backgroundVariant === 'primary' ? 'bg-background' : 'bg-secondary-background'

  return (
    <section
      id={id}
      className={['py-12 lg:py-24 2xl:py-32', bgClass, className].filter(Boolean).join(' ')}
    >
      <div className="container grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Linke Spalte: Overline + Headline */}
        <div className="min-w-0 space-y-5 [overflow-wrap:anywhere]">
          {overline && <p className="overhead mb-3">{overline}</p>}

          {headline && <h2 className="h2">{headline}</h2>}

          {intro && <p className="subhead big">{intro}</p>}
        </div>

        {/* Rechte Spalte: FAQ */}
        <div className="min-w-0 [overflow-wrap:anywhere]" data-js="accordion">
          <div className="w-full">
            {items.map((item, index) => (
              <details key={index} open={index === 0} className="group border-b border-white/20">
                <summary className="big flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-sm py-5 font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <ChevronDown
                    aria-hidden="true"
                    className="size-6 shrink-0 group-open:rotate-180"
                  />
                </summary>
                <div className="big pb-4 font-normal text-gray-300">
                  {item.answer && (
                    <RichText data={item.answer} enableGutter={false} enableProse={true} />
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
