<script setup lang="ts">
import { projects } from '~/data/portfolio'

const route = useRoute()
const project = computed(() => projects.find((entry) => entry.id === route.params.id))

if (!project.value) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found' })
}

const images = computed(() => project.value?.images.length ? project.value.images : [project.value?.cover || ''])
const isVideo = (src: string) => /\.mp4(?:$|\?)/i.test(src)
const galleryImages = computed(() => {
  const ratios = images.value.map((_, index) => {
    const [width, height] = (project.value?.imageAspectRatios[index] || '1 / 1').split('/').map(Number)
    return width && height ? width / height : 1
  })

  let pairOpen = false

  return images.value.map((src, index) => {
    const ratio = ratios[index]
    const format = ratio > 2 ? 'panorama' : ratio < 0.85 ? 'portrait' : ratio > 1.25 ? 'landscape' : 'square'

    if (index === 0) {
      pairOpen = false
      return { src, index, type: isVideo(src) ? 'video' : 'image', layout: format === 'portrait' ? 'lead-portrait' : 'lead' }
    }

    if (format === 'panorama') {
      pairOpen = false
      return { src, index, type: isVideo(src) ? 'video' : 'image', layout: 'panorama' }
    }

    if (pairOpen) {
      pairOpen = false
      return { src, index, type: isVideo(src) ? 'video' : 'image', layout: 'pair' }
    }

    const nextRatio = ratios[index + 1]
    const nextFormat = nextRatio === undefined
      ? null
      : nextRatio > 2 ? 'panorama' : nextRatio < 0.85 ? 'portrait' : nextRatio > 1.25 ? 'landscape' : 'square'

    if (format === nextFormat) {
      pairOpen = true
      return { src, index, type: isVideo(src) ? 'video' : 'image', layout: 'pair' }
    }

    return { src, index, type: isVideo(src) ? 'video' : 'image', layout: `solo-${format}` }
  })
})
const activeIndex = ref<number | null>(null)
const lightboxRef = ref<HTMLElement | null>(null)
const lightboxFigureRef = ref<HTMLElement | null>(null)
const isReturningToSource = ref(false)
const isLightboxReady = ref(false)
let triggerEl: HTMLElement | null = null
const galleryItemRefs: Array<HTMLElement | null> = []
let lightboxScrollY = 0
let returnAnimationFrame = 0
let lightboxReadyTimeout: ReturnType<typeof setTimeout> | null = null

useSeoMeta({
  title: project.value.title,
  description: project.value.description,
  ogTitle: project.value.title,
  ogDescription: project.value.description
})

const activeMedia = computed(() =>
  activeIndex.value === null ? null : images.value[activeIndex.value] ?? null
)

const { start: startCursor, stop: stopCursor } = useCustomCursor()

const setPageInert = (value: boolean) => {
  document.querySelector('.site-shell')?.toggleAttribute('inert', value)
}

const setGalleryItemRef = (element: Element | null, index: number) => {
  galleryItemRefs[index] = element instanceof HTMLElement ? element : null
}

const openLightbox = async (index: number, event: Event) => {
  if (lightboxReadyTimeout) window.clearTimeout(lightboxReadyTimeout)
  if (returnAnimationFrame) window.cancelAnimationFrame(returnAnimationFrame)

  isReturningToSource.value = false
  isLightboxReady.value = false
  lightboxScrollY = window.scrollY
  triggerEl = event.currentTarget instanceof HTMLElement ? event.currentTarget : null
  activeIndex.value = index
  setPageInert(true)
  await nextTick()
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
  activeIndex.value = null
  setPageInert(false)
  await nextTick()
  if (restoreFocus) triggerEl?.focus({ preventScroll: true })
  triggerEl = null
}

const prevImage = () => {
  if (activeIndex.value === null || activeIndex.value === 0) return
  activeIndex.value -= 1
  triggerEl = galleryItemRefs[activeIndex.value] ?? triggerEl
}

const nextImage = () => {
  if (activeIndex.value === null || activeIndex.value >= images.value.length - 1) return
  activeIndex.value += 1
  triggerEl = galleryItemRefs[activeIndex.value] ?? triggerEl
}

const handleKeydown = (event: KeyboardEvent) => {
  if (activeIndex.value === null) return

  if (event.key === 'Escape') {
    event.preventDefault()
    void closeLightbox()
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    prevImage()
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault()
    nextImage()
  }
}

const handleLightboxClick = (event: MouseEvent) => {
  if (isReturningToSource.value) return
  if (event.target instanceof HTMLElement && event.target.closest('button')) return
  void closeLightbox()
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

const handleLightboxScroll = () => {
  if (
    window.innerWidth <= 760 ||
    activeIndex.value === null ||
    !isLightboxReady.value ||
    isReturningToSource.value
  ) return

  if (Math.abs(window.scrollY - lightboxScrollY) > 15) returnToSource()
}

const handleLightboxWheel = (event: WheelEvent) => {
  if (window.innerWidth <= 760 || activeIndex.value === null || isReturningToSource.value) return

  event.preventDefault()
  const distance = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? event.deltaY * 16 : event.deltaY
  window.scrollBy({ top: distance })
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('scroll', handleLightboxScroll, { passive: true })
  startCursor()
})

onBeforeUnmount(() => {
  if (lightboxReadyTimeout) window.clearTimeout(lightboxReadyTimeout)
  if (returnAnimationFrame) window.cancelAnimationFrame(returnAnimationFrame)
  setPageInert(false)
  stopCursor()
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('scroll', handleLightboxScroll)
})
</script>

<template>
  <article class="project-page">
    <header class="project-page__header">
      <NuxtLink class="project-page__back" to="/" aria-label="Back to works">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
      </NuxtLink>
      <h1>{{ project.title }}</h1>
    </header>

    <div class="project-gallery">
      <button
        v-for="image in galleryImages"
        :key="image.src"
        class="project-gallery__item"
        :class="[
          `project-gallery__item--${image.layout}`,
          { 'project-gallery__item--featured': image.index === 0 }
        ]"
        type="button"
        data-cursor="zoom-in"
        :aria-label="`Open ${project.title} ${image.type} ${image.index + 1}`"
        :ref="(element) => setGalleryItemRef(element, image.index)"
        @click="openLightbox(image.index, $event)"
      >
        <video
          v-if="image.type === 'video'"
          :src="image.src"
          autoplay
          loop
          muted
          playsinline
          preload="metadata"
        />
        <img v-else :src="image.src" :alt="`${project.title} ${image.index + 1}`" :loading="image.index === 0 ? 'eager' : 'lazy'">
      </button>
    </div>
  </article>

  <Teleport to="body">
    <div
      v-if="activeMedia"
      ref="lightboxRef"
      class="project-lightbox project-lightbox--reference"
      :class="{ 'project-lightbox--returning': isReturningToSource }"
      data-lenis-prevent
      data-scroll-dismiss-lightbox
      data-cursor="zoom-out"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      :aria-label="project.title"
      style="--lightbox-origin-x: 0px; --lightbox-origin-y: 0px; --lightbox-origin-scale: 0.96"
      @click="handleLightboxClick"
      @wheel="handleLightboxWheel"
    >
      <button class="project-lightbox__dismiss" type="button" aria-label="Close image" @click.stop="closeLightbox">
        <span class="sr-only">Close image</span>
      </button>

      <button
        v-if="activeIndex !== null && activeIndex > 0"
        class="project-lightbox__hit project-lightbox__hit--previous"
        type="button"
        data-cursor="left-arrow"
        aria-label="Previous image"
        @click.stop="prevImage"
      >
        <span class="sr-only">Previous image</span>
      </button>

      <figure ref="lightboxFigureRef" class="project-lightbox__figure project-lightbox__figure--reference">
        <video
          v-if="isVideo(activeMedia)"
          :src="activeMedia"
          autoplay
          controls
          loop
          playsinline
        />
        <img v-else :src="activeMedia" :alt="project.title">
      </figure>

      <button
        v-if="activeIndex !== null && activeIndex < images.length - 1"
        class="project-lightbox__hit project-lightbox__hit--next"
        type="button"
        data-cursor="right-arrow"
        aria-label="Next image"
        @click.stop="nextImage"
      >
        <span class="sr-only">Next image</span>
      </button>
    </div>
  </Teleport>
</template>
