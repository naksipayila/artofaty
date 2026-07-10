type CursorIcon = 'zoom-in' | 'zoom-out' | 'left-arrow' | 'right-arrow'

const icons: Record<CursorIcon, string> = {
  'zoom-in': [
    '<circle cx="30" cy="30" r="29" fill="none" stroke="#fff" stroke-width="2" />',
    '<rect x="29" y="20" width="2" height="20" rx="1" fill="#fff" />',
    '<rect x="40" y="29" width="2" height="20" rx="1" transform="rotate(90 40 29)" fill="#fff" />'
  ].join(''),
  'zoom-out': [
    '<circle cx="30" cy="30" r="29" fill="none" stroke="#fff" stroke-width="2" />',
    '<rect x="40" y="29" width="2" height="20" rx="1" transform="rotate(90 40 29)" fill="#fff" />'
  ].join(''),
  'left-arrow': '<path d="M38 12 20 30l18 18" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />',
  'right-arrow': '<path d="m22 12 18 18-18 18" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />'
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
    window.matchMedia('(hover: hover) and (pointer: fine)').matches

  const createCursorElement = () => {
    if (cursorEl) return

    cursorEl = document.createElement('div')
    cursorEl.style.position = 'fixed'
    cursorEl.style.top = '0'
    cursorEl.style.left = '0'
    cursorEl.style.display = 'none'
    cursorEl.style.width = '60px'
    cursorEl.style.height = '60px'
    cursorEl.style.pointerEvents = 'none'
    cursorEl.style.zIndex = '10000'
    cursorEl.style.mixBlendMode = 'difference'
    cursorEl.style.willChange = 'transform'
    cursorEl.style.transition = 'transform 100ms ease-out'

    svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svgEl.setAttribute('width', '60')
    svgEl.setAttribute('height', '60')
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
    const scale = mouseDown ? 0.84 : 0.7
    cursorEl.style.transform = `translate(${mouseX - 30}px, ${mouseY - 30}px) scale(${scale})`
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
    updateTransform()
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

  return { start, stop }
}
