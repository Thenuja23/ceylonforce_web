import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useLenis(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true })
    const root = document.documentElement

    ScrollTrigger.scrollerProxy(root, {
      scrollTop(value) {
        if (typeof value === 'number') {
          lenis.scrollTo(value, { immediate: true })
        }
        return lenis.scroll
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        }
      },
    })

    const onScroll = () => ScrollTrigger.update()
    const tick = (time: number) => lenis.raf(time * 1000)
    const onRefresh = () => lenis.resize()

    lenis.on('scroll', onScroll)
    ScrollTrigger.addEventListener('refresh', onRefresh)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    ScrollTrigger.refresh()

    return () => {
      gsap.ticker.remove(tick)
      lenis.off('scroll', onScroll)
      ScrollTrigger.removeEventListener('refresh', onRefresh)
      ScrollTrigger.scrollerProxy(root, {})
      lenis.destroy()
    }
  }, [enabled])
}
