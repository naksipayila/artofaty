type CursorIcon = 'zoom-in' | 'zoom-out' | 'left-arrow' | 'right-arrow'

const icons: Record<CursorIcon, string> = {
  'zoom-in': '<path d="M25 15H15v10m20-10h10v10m0 10v10H35M25 45H15V35" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />',
  'zoom-out': '<path d="m21 21 18 18m0-18L21 39" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" />',
  'left-arrow': '<path d="m36 17-13 13 13 13M23 30h23" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />',
  'right-arrow': '<path d="m24 17 13 13-13 13m13-13H14" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />'
}

const isCursorIcon = (value: string | undefined): value is CursorIcon =>
  value === 'zoom-in' || value === 'zoom-out' || value === 'left-arrow' || value === 'right-arrow'

export function useCustomCursor() {
  let cursorEl: HTMLDivElement | null = null
  let svgEl: SVGSVGElement | null = null
  let attached = false
  let mouseX = 0
  let mouseY = 0
  let mouseDown = false
  let currentIcon: CursorIcon | null = null

  const supportsCustomCursor = () =>
    window.innerWidth > 760 && window.matchMedia('(hover: hover) and (pointer: fine)').matches

  const createCursorElement = () => {
    if (cursorEl) return

    cursorEl = document.createElement('div')
    cursorEl.style.position = 'fixed'
    cursorEl.style.top = '0'
    cursorEl.style.left = '0'
    cursorEl.style.display = 'none'
    cursorEl.style.width = '52px'
    cursorEl.style.height = '52px'
    cursorEl.style.pointerEvents = 'none'
    cursorEl.style.zIndex = '10000'
    cursorEl.style.mixBlendMode = 'difference'
    cursorEl.style.willChange = 'transform'
    cursorEl.style.transition = 'transform 100ms ease-out'

    svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svgEl.setAttribute('width', '52')
    svgEl.setAttribute('height', '52')
    svgEl.setAttribute('viewBox', '0 0 60 60')

    cursorEl.appendChild(svgEl)
    document.body.appendChild(cursorEl)
  }

  const hideCursor = () => {
    if (cursorEl) cursorEl.style.display = 'none'
    currentIcon = null
  }

  const setIcon = (icon: CursorIcon) => {
    if (!cursorEl || !svgEl) return

    if (currentIcon !== icon) {
      svgEl.innerHTML = icons[icon]
      currentIcon = icon
    }

    cursorEl.style.display = 'block'
  }

  const updateTransform = () => {
    if (!cursorEl) return
    const scale = mouseDown ? 0.78 : 0.92
    cursorEl.style.transform = `translate(${mouseX - 26}px, ${mouseY - 26}px) scale(${scale})`
  }

  const updateCursor = (target: EventTarget | null) => {
    const cursorTarget = target instanceof Element
      ? target.closest<HTMLElement>('[data-cursor]')
      : null
    const icon = cursorTarget?.dataset.cursor

    if (!isCursorIcon(icon)) {
      hideCursor()
      return
    }

    // Only interactive artwork areas hide the native pointer.
    cursorTarget.style.cursor = 'none'
    setIcon(icon)
    updateTransform()
  }

  const onMouseMove = (event: MouseEvent) => {
    mouseX = event.clientX
    mouseY = event.clientY
    updateCursor(event.target)
  }

  const refresh = () => {
    if (!cursorEl) return
    updateCursor(document.elementFromPoint(mouseX, mouseY))
  }

  const onMouseDown = () => {
    mouseDown = true
    updateTransform()
  }

  const onMouseUp = () => {
    mouseDown = false
    updateTransform()
  }

  const start = () => {
    if (attached || !supportsCustomCursor()) return
    attached = true
    createCursorElement()
    document.addEventListener('mousemove', onMouseMove, { passive: true })
    document.addEventListener('mousedown', onMouseDown, { passive: true })
    document.addEventListener('mouseup', onMouseUp, { passive: true })
    window.addEventListener('blur', hideCursor)
  }

  const stop = () => {
    if (!attached) return
    attached = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mousedown', onMouseDown)
    document.removeEventListener('mouseup', onMouseUp)
    window.removeEventListener('blur', hideCursor)
    cursorEl?.remove()
    cursorEl = null
    svgEl = null
    currentIcon = null
  }

  return { start, stop, refresh }
}
