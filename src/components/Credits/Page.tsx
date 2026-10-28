import type { Page } from '@/payload-types'
import RichText from '@/components/RichText'
import { RenderHero } from '@/heros/RenderHero'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import styles from './credits.module.css'

export function CreditsPage({ hero, layout }: Pick<Page, 'hero' | 'layout'>) {
  return (
    <div className={styles.page}>
      {hero.type === 'lowImpact' ? (
        <header className={`container ${styles.hero}`}>
          <div className={styles.heroText}>
            <p className={`overhead ${styles.eyebrow}`}>
              <span aria-hidden="true" className={styles.dot} />
              Quellen & Ressourcen
            </p>
            {hero.richText && <RichText data={hero.richText} enableGutter={false} />}
            <p className={styles.intro}>Danke an die kreativen Köpfe dahinter.</p>
          </div>
          <svg
            className={styles.illustration}
            viewBox="0 0 360 240"
            fill="none"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M20 52H340M20 190H340M70 20V220M290 20V220" className={styles.guide} />
            <ellipse cx="180" cy="202" rx="120" ry="5" className={styles.shadow} />
            <g
              stroke="currentColor"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.brackets}
            >
              <path d="M77 81L43 120L77 159M283 81L317 120L283 159" />
            </g>
            <path
              d="M180 166L133 121C105 94 143 56 168 82L180 94L192 82C217 56 255 94 227 121Z"
              className={styles.heart}
              stroke="currentColor"
              strokeWidth="9"
              strokeLinejoin="round"
            />
            <path
              d="M253 38V52M246 45H260M108 175V185M103 180H113"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className={styles.spark}
            />
          </svg>
        </header>
      ) : (
        <RenderHero {...hero} />
      )}
      <RenderBlocks blocks={layout} contentAppearance="credits" />
    </div>
  )
}
