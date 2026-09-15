import { useEffect, useRef } from 'react'

export type CursorState = 'default' | 'hover' | 'explore' | 'drag'

export function useCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null)
  const stateRef = useRef<CursorState>('default')

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    const hasFinePointer = window.matchMedia('(pointer: fine)').matches
    if (!hasFinePointer) {
      cursor.style.display = 'none'
      return
    }

    let rafId = 0
    let mouseX = 0
    let mouseY = 0
    let curX = 0
    let curY = 0

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    const tick = () => {
      curX = lerp(curX, mouseX, 0.18)
      curY = lerp(curY, mouseY, 0.18)
      cursor.style.transform = `translate(${curX}px, ${curY}px) translate(-50%, -50%)`
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    const onMove = (e: PointerEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const onOver = (e: Event) => {
      const t = e.target as HTMLElement | null
      if (!t) return
      let next: CursorState = 'default'
      if (t.closest('[data-cursor="explore"]')) next = 'explore'
      else if (t.closest('[data-cursor="drag"]')) next = 'drag'
      else if (t.closest('a, button, [role="button"]')) next = 'hover'

      if (next !== stateRef.current) {
        stateRef.current = next
        cursor.dataset.state = next
      }
    }

    const onLeave = () => {
      stateRef.current = 'default'
      cursor.dataset.state = 'default'
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerover', onOver)
    window.addEventListener('pointerleave', onLeave)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      window.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return cursorRef
}
