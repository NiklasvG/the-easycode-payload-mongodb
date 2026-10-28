'use client'

import { lazy, Suspense, useRef } from 'react'
import { useInView } from 'framer-motion'
import type { LottieSvgProps } from 'lottie-react'
import type { LottieIconNames } from '@/fields/lottieIcon'

type PlaybackProps = { triggerPlay: boolean }
function loadIcon(loadData: () => Promise<{ default: LottieSvgProps['src'] }>) {
  return lazy(async () => {
    const [{ default: Player }, { default: animationData }] = await Promise.all([
      import('./LottiePlayer'), loadData(),
    ])
    return { default: function IconPlayer(props: PlaybackProps) {
      return <Player {...props} animationData={animationData} />
    } }
  })
}

// Module-level lazy components keep identities stable and fetch only the selected icon.
const icons = {
  apple: loadIcon(() => import('@/Icons/Apple.json')),
  applause: loadIcon(() => import('@/Icons/Applause.json')),
  book: loadIcon(() => import('@/Icons/Book.json')),
  cart: loadIcon(() => import('@/Icons/Cart.json')),
  clock: loadIcon(() => import('@/Icons/Clock.json')),
  cloud: loadIcon(() => import('@/Icons/Cloud.json')),
  code: loadIcon(() => import('@/Icons/Code.json')),
  computer: loadIcon(() => import('@/Icons/Computer.json')),
  confetti: loadIcon(() => import('@/Icons/Confetti.json')),
  developer: loadIcon(() => import('@/Icons/Developer.json')),
  engagement: loadIcon(() => import('@/Icons/Engagement.json')),
  firework: loadIcon(() => import('@/Icons/Firework.json')),
  git: loadIcon(() => import('@/Icons/Git.json')),
  loadBalancer: loadIcon(() => import('@/Icons/Load-Balancer.json')),
  mail: loadIcon(() => import('@/Icons/Mail.json')),
  pen: loadIcon(() => import('@/Icons/Pen.json')),
  school: loadIcon(() => import('@/Icons/School.json')),
  server: loadIcon(() => import('@/Icons/Server.json')),
} satisfies Record<LottieIconNames, ReturnType<typeof loadIcon>>

export default function LottieIcon({ icon, triggerPlay }: PlaybackProps & { icon: LottieIconNames }) {
  const container = useRef<HTMLDivElement>(null)
  const visible = useInView(container, { once: true, margin: '200px' })
  const Icon = icons[icon] || icons.computer
  return (
    <div ref={container} className="service-card--icon shrink-0">
      {visible && <Suspense fallback={null}><Icon triggerPlay={triggerPlay} /></Suspense>}
    </div>
  )
}
