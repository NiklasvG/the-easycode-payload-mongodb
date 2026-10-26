import React from 'react'
import { act, cleanup, render } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import LottiePlayer from '@/components/shared/Functional/LottiePlayer'

const playback = vi.hoisted(() => ({ pause: vi.fn(), play: vi.fn(), seek: vi.fn() }))
vi.mock('lottie-react', () => ({
  LottieSvg: ({ lottieRef }: { lottieRef: React.RefObject<unknown> }) => {
    React.useImperativeHandle(lottieRef, () => playback)
    return React.createElement('svg')
  },
}))

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

it('pauses decorative SVG playback outside the viewport and while the tab is hidden', () => {
  const observers: {
    callback: IntersectionObserverCallback
    disconnect: ReturnType<typeof vi.fn>
  }[] = []
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      disconnect = vi.fn()
      observe = vi.fn()
      constructor(callback: IntersectionObserverCallback) {
        observers.push({ callback, disconnect: this.disconnect })
      }
    },
  )
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi
      .fn()
      .mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  })
  let hidden = false
  vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden)
  const { rerender, unmount } = render(
    React.createElement(LottiePlayer, {
      animationData: {} as never,
      triggerPlay: false,
    }),
  )
  const setVisible = (isIntersecting: boolean) =>
    act(() =>
      observers[0].callback(
        [{ isIntersecting } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      ),
    )
  setVisible(true)
  rerender(React.createElement(LottiePlayer, { animationData: {} as never, triggerPlay: true }))
  expect(playback.play).toHaveBeenCalledTimes(1)
  setVisible(false)
  expect(playback.pause).toHaveBeenCalled()
  hidden = true
  setVisible(true)
  expect(playback.play).toHaveBeenCalledTimes(1)
  hidden = false
  act(() => document.dispatchEvent(new Event('visibilitychange')))
  expect(playback.play).toHaveBeenCalledTimes(2)
  unmount()
  expect(observers[0].disconnect).toHaveBeenCalledOnce()
})
