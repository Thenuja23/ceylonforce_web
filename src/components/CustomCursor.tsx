import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return

    const dot = dotRef.current
    const ring = ringRef.current
    const label = labelRef.current
    if (!dot || !ring) return

    let mouseX = -100
    let mouseY = -100
    let ringX = -100
    let ringY = -100
    let raf = 0

    const onMove = (e: PointerEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      dot.style.transform = `translate(${mouseX}px,${mouseY}px) translate(-50%,-50%)`
    }

    const onOver = (e: Event) => {
      const target = e.target as HTMLElement | null
      if (!target || !ring) return

      const isLink = !!target.closest('a, button')
      const isDrag = !!target.closest('[data-cursor="drag"]')
      const isView = !!target.closest('[data-cursor="view"]')
      const isExplore = !!target.closest('[data-cursor="explore"]')

      ring.classList.toggle('is-link', isLink && !isDrag && !isView && !isExplore)
      ring.classList.toggle('is-drag', isDrag)
      ring.classList.toggle('is-view', isView)
      ring.classList.toggle('is-explore', isExplore)

      if (label) {
        label.textContent = isDrag ? 'DRAG' : isView ? 'VIEW' : isExplore ? 'EXPLORE' : ''
        label.style.opacity = (isDrag || isView || isExplore) ? '1' : '0'
      }
    }

    const tick = () => {
      ringX += (mouseX - ringX) * 0.12
      ringY += (mouseY - ringY) * 0.12
      ring.style.transform = `translate(${ringX}px,${ringY}px) translate(-50%,-50%)`
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerover', onOver)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="cf-cursor__dot" aria-hidden="true" />
      <div ref={ringRef} className="cf-cursor__ring" aria-hidden="true">
        <span ref={labelRef} className="cf-cursor__label" aria-hidden="true" />
      </div>
    </>
  )
}
