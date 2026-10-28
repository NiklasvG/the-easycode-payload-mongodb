import Link from 'next/link'
import React from 'react'
import { ArrowUpRight, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import styles from './not-found.module.css'

export default function NotFound() {
  return (
    <section className={`container ${styles.page}`} aria-labelledby="not-found-title">
      <div className={styles.content}>
        <p className={`overhead ${styles.eyebrow}`}>
          <span aria-hidden="true" className={styles.statusDot} />
          Fehler 404
        </p>
        <h1 id="not-found-title" className={styles.title}>
          Seite nicht gefunden
          <span aria-hidden="true" className="text-accent">
            .
          </span>
        </h1>
        <p className={styles.lead}>Diese Seite hat sich wohl im Code verirrt.</p>
        <p className={styles.description}>
          Vielleicht wurde sie verschoben oder der Link ist nicht mehr aktuell. Auf der Startseite
          oder über die Suche findest du wieder Anschluss.
        </p>
        <div className={styles.actions}>
          <Button asChild variant="default">
            <Link href="/">
              Zur Startseite <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/suche">
              <Search aria-hidden="true" /> Zur Suche
            </Link>
          </Button>
        </div>
        <p className={styles.help}>
          Ein Link funktioniert nicht?{' '}
          <Link href="/kontakt" className={styles.contact}>
            Sag mir Bescheid.
          </Link>
        </p>
      </div>
      <div className={styles.illustration} aria-hidden="true">
        <svg className={styles.scene} viewBox="0 0 600 420" fill="none" focusable="false">
          <path className={styles.guide} d="M28 86H572M28 326H572M100 42V378M500 42V378" />
          <ellipse className={styles.shadow} cx="300" cy="345" rx="222" ry="9" />
          <g
            className={styles.fours}
            stroke="currentColor"
            strokeWidth="27"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M124 115L62 250H175M151 180V303" />
            <path d="M487 115L425 250H538M514 180V303" />
          </g>
          <g className={styles.zero}>
            <rect x="220" y="103" width="160" height="208" rx="80" className={styles.zeroFill} />
            <rect
              x="220"
              y="103"
              width="160"
              height="208"
              rx="80"
              stroke="currentColor"
              strokeWidth="25"
            />
            <g className={styles.eyes}>
              <rect x="262" y="172" width="10" height="27" rx="5" fill="currentColor" />
              <rect x="302" y="172" width="10" height="27" rx="5" fill="currentColor" />
            </g>
            <path
              d="M280 234Q298 224 316 234"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </g>
          <g className={styles.spark} stroke="currentColor" strokeWidth="5" strokeLinecap="round">
            <path d="M393 62V77M416 74L406 85M424 98H410" />
          </g>
          <path
            className={styles.code}
            d="M270 375L260 385L270 395M330 375L340 385L330 395M307 371L293 399"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  )
}
