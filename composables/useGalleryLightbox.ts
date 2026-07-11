export type GalleryLightboxMedia = {
  src: string
  type: 'image' | 'video'
}

export type GalleryLightboxItem = {
  src: string
  title: string
  media?: GalleryLightboxMedia[]
}

export function useGalleryLightbox(items: GalleryLightboxItem[] = []) {
  const activeItem = ref<GalleryLightboxItem | null>(null)
  const activeMediaIndex = ref(0)
  const lightboxRef = ref<HTMLElement | null>(null)
  const lightboxOrigin = ref({ x: 0, y: 0, scale: 0.16 })
  let triggerEl: HTMLElement | null = null
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
  }

  const closeLightbox = async () => {
    activeItem.value = null
    activeMediaIndex.value = 0
    setPageInert(false)
    await nextTick()
    refreshCursor()
    triggerEl?.focus()
    triggerEl = null
  }

  const selectMedia = async (item: GalleryLightboxItem, index: number) => {
    activeItem.value = item
    activeMediaIndex.value = index
    await nextTick()
    refreshCursor()
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

  const handleLightboxClick = (event: MouseEvent) => {
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
    startCursor()
  })

  onBeforeUnmount(() => {
    setPageInert(false)
    stopCursor()
    window.removeEventListener('keydown', handleKeydown)
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
    lightboxOrigin,
    lightboxRef,
    lightboxStyle,
    nextMedia,
    openLightbox,
    previousMedia
  }
}
