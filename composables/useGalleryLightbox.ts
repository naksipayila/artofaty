export type GalleryLightboxMedia = {
  src: string
  type: 'image' | 'video'
}

export type GalleryLightboxItem = {
  src: string
  title: string
  media?: GalleryLightboxMedia[]
  href?: string
}

export function useGalleryLightbox(items: GalleryLightboxItem[] = []) {
  const activeItem = ref<GalleryLightboxItem | null>(null)
  const activeMediaIndex = ref(0)
  const lightboxRef = ref<HTMLElement | null>(null)
  const lightboxFigureRef = ref<HTMLElement | null>(null)
  const lightboxOrigin = ref({ x: 0, y: 0, scale: 0.16 })
  const isReturningToSource = ref(false)
  const isLightboxReady = ref(false)
  let triggerEl: HTMLElement | null = null
  let returnAnimationFrame = 0
  let lightboxReadyTimeout: ReturnType<typeof setTimeout> | null = null
  let touchStart: { x: number, y: number } | null = null

  const lightboxStyle = computed(() => ({
    '--lightbox-origin-x': `${lightboxOrigin.value.x}px`,
    '--lightbox-origin-y': `${lightboxOrigin.value.y}px`,
    '--lightbox-origin-scale': String(lightboxOrigin.value.scale)
  }))

  const mediaFor = (item: GalleryLightboxItem): GalleryLightboxMedia[] =>
    item.media || [{ src: item.src, type: 'image' }]

  const lightboxMedia = computed<GalleryLightboxMedia[]>(() =>
    activeItem.value ? mediaFor(activeItem.value) : []
  )
  const activeMedia = computed(() => lightboxMedia.value[activeMediaIndex.value] || null)
  const activeItemIndex = computed(() => activeItem.value ? items.indexOf(toRaw(activeItem.value)) : -1)
  const hasPreviousMedia = computed(() =>
    activeMediaIndex.value > 0 || activeItemIndex.value > 0
  )
  const hasNextMedia = computed(() =>
    activeMediaIndex.value < lightboxMedia.value.length - 1 || activeItemIndex.value < items.length - 1
  )
  const { start: startCursor, stop: stopCursor, refresh: refreshCursor } = useCustomCursor()

  const getFocusableElements = (container: HTMLElement) =>
    [...container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
    )].filter((element) => !element.hasAttribute('disabled'))

  const setPageInert = (value: boolean) => {
    document.querySelector('.site-shell')?.toggleAttribute('inert', value)
  }

  const sourceForItem = (item: GalleryLightboxItem) => {
    const index = items.indexOf(toRaw(item))
    return index < 0
      ? null
      : document.querySelector<HTMLElement>(`[data-gallery-lightbox-index="${index}"]`)
  }

  const trapFocus = (event: KeyboardEvent) => {
    if (event.key !== 'Tab' || !lightboxRef.value) return

    const elements = getFocusableElements(lightboxRef.value)
    if (!elements.length) {
      event.preventDefault()
      lightboxRef.value.focus()
      return
    }

    const first = elements[0]
    const last = elements[elements.length - 1]
    const activeElement = document.activeElement

    if (event.shiftKey && (activeElement === first || activeElement === lightboxRef.value)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && (activeElement === last || activeElement === lightboxRef.value)) {
      event.preventDefault()
      first.focus()
    }
  }

  const openLightbox = async (item: GalleryLightboxItem, event: Event) => {
    if (lightboxReadyTimeout) window.clearTimeout(lightboxReadyTimeout)
    if (returnAnimationFrame) window.cancelAnimationFrame(returnAnimationFrame)

    isReturningToSource.value = false
    isLightboxReady.value = false
    triggerEl = event.currentTarget instanceof HTMLElement ? event.currentTarget : null

    if (triggerEl) {
      const rect = triggerEl.getBoundingClientRect()
      lightboxOrigin.value = {
        x: rect.left + rect.width / 2 - window.innerWidth / 2,
        y: rect.top + rect.height / 2 - window.innerHeight / 2,
        scale: Math.min(1, Math.max(0.08, rect.width / window.innerWidth))
      }
    }

    activeItem.value = item
    activeMediaIndex.value = 0
    setPageInert(true)
    await nextTick()
    refreshCursor()
    lightboxRef.value?.focus()

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      isLightboxReady.value = true
      return
    }

    lightboxReadyTimeout = window.setTimeout(() => {
      isLightboxReady.value = true
      lightboxReadyTimeout = null
    }, 220)
  }

  const closeLightbox = async (restoreFocus = true) => {
    if (lightboxReadyTimeout) window.clearTimeout(lightboxReadyTimeout)
    if (returnAnimationFrame) window.cancelAnimationFrame(returnAnimationFrame)

    lightboxReadyTimeout = null
    returnAnimationFrame = 0
    isReturningToSource.value = false
    isLightboxReady.value = false
    activeItem.value = null
    activeMediaIndex.value = 0
    setPageInert(false)
    await nextTick()
    refreshCursor()
    if (restoreFocus) triggerEl?.focus({ preventScroll: true })
    triggerEl = null
  }

  const selectMedia = async (item: GalleryLightboxItem, index: number) => {
    if (item.href) {
      await navigateTo(item.href)
      return
    }

    activeItem.value = item
    activeMediaIndex.value = index
    triggerEl = sourceForItem(item) ?? triggerEl
    await nextTick()
  }

  const previousMedia = async () => {
    if (activeMediaIndex.value > 0 && activeItem.value) {
      await selectMedia(activeItem.value, activeMediaIndex.value - 1)
      return
    }

    const previousItem = items[activeItemIndex.value - 1]
    if (previousItem) {
      await selectMedia(previousItem, mediaFor(previousItem).length - 1)
    }
  }

  const nextMedia = async () => {
    if (activeMediaIndex.value < lightboxMedia.value.length - 1 && activeItem.value) {
      await selectMedia(activeItem.value, activeMediaIndex.value + 1)
      return
    }

    const nextItem = items[activeItemIndex.value + 1]
    if (nextItem) {
      await selectMedia(nextItem, 0)
    }
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (!activeItem.value) return
    trapFocus(event)

    if (event.key === 'Escape') {
      event.preventDefault()
      void closeLightbox()
    }

    if (event.key === 'ArrowLeft' && hasPreviousMedia.value) {
      event.preventDefault()
      void previousMedia()
    }

    if (event.key === 'ArrowRight' && hasNextMedia.value) {
      event.preventDefault()
      void nextMedia()
    }
  }

  const returnToSource = () => {
    const figure = lightboxFigureRef.value
    const source = triggerEl

    if (!figure || !source || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      void closeLightbox(false)
      return
    }

    const startRect = figure.getBoundingClientRect()
    if (!startRect.width || !startRect.height) {
      void closeLightbox(false)
      return
    }

    isReturningToSource.value = true
    figure.style.transformOrigin = 'top left'
    const startedAt = performance.now()

    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / 200, 1)
      const eased = 1 - (1 - progress) ** 2
      const targetRect = source.getBoundingClientRect()
      const translateX = (targetRect.left - startRect.left) * eased
      const translateY = (targetRect.top - startRect.top) * eased
      const scale = 1 + ((targetRect.width / startRect.width) - 1) * eased

      figure.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`

      if (progress < 1) {
        returnAnimationFrame = window.requestAnimationFrame(animate)
        return
      }

      returnAnimationFrame = 0
      void closeLightbox(false)
    }

    returnAnimationFrame = window.requestAnimationFrame(animate)
  }

  const handleLightboxWheel = (event: WheelEvent) => {
    if (window.innerWidth <= 760 || !activeItem.value) return

    event.preventDefault()
    if (!isLightboxReady.value || isReturningToSource.value || event.deltaY <= 0) return

    returnToSource()
  }

  const handleLightboxClick = (event: MouseEvent) => {
    if (isReturningToSource.value) return
    if (window.innerWidth <= 760 && event.target !== event.currentTarget) return
    if (event.target instanceof HTMLElement && event.target.closest('button')) return
    void closeLightbox()
  }

  const handleLightboxTouchStart = (event: TouchEvent) => {
    if (event.touches.length !== 1 || event.target instanceof HTMLElement && event.target.closest('button')) {
      touchStart = null
      return
    }

    const touch = event.touches[0]
    touchStart = { x: touch.clientX, y: touch.clientY }
  }

  const handleLightboxTouchEnd = (event: TouchEvent) => {
    if (!touchStart || event.changedTouches.length !== 1) return

    const touch = event.changedTouches[0]
    const distanceX = touch.clientX - touchStart.x
    const distanceY = touch.clientY - touchStart.y
    touchStart = null

    if (Math.abs(distanceX) < 48 || Math.abs(distanceX) <= Math.abs(distanceY)) return

    if (distanceX < 0) {
      void nextMedia()
    } else {
      void previousMedia()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('wheel', handleLightboxWheel, { capture: true, passive: false })
    startCursor()
  })

  onBeforeUnmount(() => {
    if (lightboxReadyTimeout) window.clearTimeout(lightboxReadyTimeout)
    if (returnAnimationFrame) window.cancelAnimationFrame(returnAnimationFrame)
    setPageInert(false)
    stopCursor()
    window.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('wheel', handleLightboxWheel, true)
  })

  return {
    activeItem,
    activeMedia,
    activeMediaIndex,
    closeLightbox,
    handleLightboxClick,
    handleLightboxTouchEnd,
    handleLightboxTouchStart,
    hasNextMedia,
    hasPreviousMedia,
    isReturningToSource,
    lightboxFigureRef,
    lightboxOrigin,
    lightboxRef,
    lightboxStyle,
    nextMedia,
    openLightbox,
    previousMedia
  }
}
