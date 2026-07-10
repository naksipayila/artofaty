import { ref } from 'vue'

type CursorIcon = 'hidden' | 'zoom-in' | 'zoom-out' | 'left-arrow' | 'right-arrow'

function createSvgContent(icon: CursorIcon): string {
  switch (icon) {
    case 'zoom-in':
      return [
        '<circle cx="30" cy="30" r="22" fill="none" stroke="#fff" stroke-width="2" />',
        '<line x1="30" y1="18" x2="30" y2="42" stroke="#fff" stroke-width="2" />',
        '<line x1="18" y1="30" x2="42" y2="30" stroke="#fff" stroke-width="2" />'
      ].join('')
    case 'zoom-out':
      return [
        '<circle cx="30" cy="30" r="22" fill="none" stroke="#fff" stroke-width="2" />',
        '<line x1="18" y1="30" x2="42" y2="30" stroke="#fff" stroke-width="2" />'
      ].join('')
    case 'left-arrow':
      return '<polyline points="36,14 18,30 36,46" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />'
    case 'right-arrow':
      return '<polyline points="24,14 42,30 24,46" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />'
    default:
      return ''
  }
}

function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return true
  return !window.matchMedia('(pointer: fine)').matches || 'ontouchstart' in window
}

export function useCustomCursor() {
  const lightboxOpen = ref(false)
  const container = ref<HTMLElement | null>(null)

  let cursorEl: HTMLDivElement | null = null
  let svgEl: SVGSVGElement | null = null
  let styleEl: HTMLStyleElement | null = null
  let attached = false
  let rafId = 0
  let mouseX = 0
  let mouseY = 0
  let mouseDown = false
  let currentIcon: CursorIcon = 'hidden'
  let lightboxObserver: MutationObserver | null = null

  function createCursorElement() {
    if (cursorEl) return

    styleEl = document.createElement('style')
    styleEl.textContent = 'body, body * { cursor: none !important; }'
    document.head.appendChild(styleEl)

    cursorEl = document.createElement('div')
    cursorEl.style.position = 'fixed'
    cursorEl.style.top = '0'
    cursorEl.style.left = '0'
    cursorEl.style.width = '60px'
    cursorEl.style.height = '60px'
    cursorEl.style.pointerEvents = 'none'
    cursorEl.style.zIndex = '10000'
    cursorEl.style.opacity = '0'
    cursorEl.style.transform = 'translate(-30px, -30px) scale(1)'
    cursorEl.style.transition = 'transform 0.2s ease-out'
    cursorEl.style.mixBlendMode = 'difference'
    cursorEl.style.willChange = 'transform, opacity'

    svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svgEl.setAttribute('width', '60')
    svgEl.setAttribute('height', '60')
    svgEl.setAttribute('viewBox', '0 0 60 60')

    cursorEl.appendChild(svgEl)
    document.body.appendChild(cursorEl)
    container.value = cursorEl
  }

  function removeCursorElement() {
    if (cursorEl?.parentNode) {
      cursorEl.parentNode.removeChild(cursorEl)
    }
    cursorEl = null
    svgEl = null
    container.value = null

    if (styleEl?.parentNode) {
      styleEl.parentNode.removeChild(styleEl)
    }
    styleEl = null
  }

  function setIcon(icon: CursorIcon) {
    if (currentIcon === icon) return
    currentIcon = icon

    if (!svgEl || !cursorEl) return
    svgEl.innerHTML = createSvgContent(icon)
    cursorEl.style.opacity = icon === 'hidden' ? '0' : '1'
  }

  function updateTransform() {
    if (!cursorEl) return
    const scale = mouseDown ? 0.85 : 1
    cursorEl.style.transform = `translate(${mouseX - 30}px, ${mouseY - 30}px) scale(${scale})`
  }

  function iconForPosition(clientX: number, clientY: number): CursorIcon {
    const lightbox = document.querySelector('.project-lightbox')
    if (lightbox) {
      lightboxOpen.value = true
      const rect = lightbox.getBoundingClientRect()
      const relX = clientX - rect.left
      const relY = clientY - rect.top
      const w = rect.width
      const h = rect.height

      if (relY < h * 0.1 || relY > h - 200) return 'zoom-out'
      if (relX < w * 0.2) return 'left-arrow'
      if (relX > w * 0.8) return 'right-arrow'
      return 'zoom-out'
    }

    lightboxOpen.value = false
    const fromPoint = document.elementFromPoint(clientX, clientY)
    if (fromPoint?.closest('.fabrica-card__media')) return 'zoom-in'
    return 'hidden'
  }

  function onMouseMove(e: MouseEvent) {
    mouseX = e.clientX
    mouseY = e.clientY

    cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(() => {
      setIcon(iconForPosition(e.clientX, e.clientY))
      updateTransform()
    })
  }

  function onMouseDown() {
    mouseDown = true
    cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(updateTransform)
  }

  function onMouseUp() {
    mouseDown = false
    cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(updateTransform)
  }

  function onMouseLeave() {
    if (cursorEl) cursorEl.style.opacity = '0'
    currentIcon = 'hidden'
  }

  function startObservingLightbox() {
    lightboxOpen.value = Boolean(document.querySelector('.project-lightbox'))
    lightboxObserver = new MutationObserver(() => {
      lightboxOpen.value = Boolean(document.querySelector('.project-lightbox'))
    })
    lightboxObserver.observe(document.body, { childList: true, subtree: true })
  }

  function start() {
    if (attached || isTouchDevice()) return
    attached = true

    createCursorElement()
    document.addEventListener('mousemove', onMouseMove, { passive: true })
    document.addEventListener('mousedown', onMouseDown, { passive: true })
    document.addEventListener('mouseup', onMouseUp, { passive: true })
    document.addEventListener('mouseleave', onMouseLeave, { passive: true })
    startObservingLightbox()
  }

  function stop() {
    if (!attached) return
    attached = false

    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mousedown', onMouseDown)
    document.removeEventListener('mouseup', onMouseUp)
    document.removeEventListener('mouseleave', onMouseLeave)

    lightboxObserver?.disconnect()
    lightboxObserver = null

    cancelAnimationFrame(rafId)
    removeCursorElement()
  }

  return {
    container,
    lightboxOpen,
    start,
    stop
  }
}
