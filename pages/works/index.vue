<script setup lang="ts">
import { projects } from '~/data/portfolio'

type GalleryItem = {
  id: string
  src: string
  title: string
  aspectRatio: number
  order: number
}

const toAspectRatio = (value: string) => {
  const [width, height] = value.split('/').map(Number)
  return width && height ? width / height : 1
}

const galleryItems = computed<GalleryItem[]>(() => {
  let order = 0

  return projects.flatMap((project) => {
    const images = project.images.length > 0 ? project.images : [project.cover]

    return images.map((src, index) => ({
      id: `${project.id}-${index}`,
      src,
      title: project.title,
      aspectRatio: toAspectRatio(project.imageAspectRatios[index] || '1 / 1'),
      order: order++
    }))
  })
})

// Carbonmade lays out images in proportional rows instead of independent columns.
const galleryRows = computed(() => {
  const rows: GalleryItem[][] = []
  let row: GalleryItem[] = []

  for (const item of galleryItems.value) {
    if (row.length === 0 && item.aspectRatio >= 1.6) {
      rows.push([item])
      continue
    }

    row.push(item)

    if (row.length === 2 || row.reduce((sum, entry) => sum + entry.aspectRatio, 0) >= 1.8) {
      rows.push(row)
      row = []
    }
  }

  if (row.length) rows.push(row)

  return rows
})

useSeoMeta({
  title: 'Works',
  description: 'Character art and illustrations by Ali Taha Yapışkan.',
  ogTitle: 'ATY',
  ogDescription: 'Character art and illustrations by Ali Taha Yapışkan.'
})

const activeIndex = ref<number | null>(null)
const lightboxRef = ref<HTMLElement | null>(null)
const lightboxOrigin = ref({ x: 0, y: 0, scale: 0.16 })
const slideDirection = ref<'next' | 'previous' | null>(null)
let triggerEl: HTMLElement | null = null
let touchStartX: number | null = null
let didSwipe = false

const activeItem = computed(() =>
  activeIndex.value === null ? null : galleryItems.value[activeIndex.value] ?? null
)

const lightboxStyle = computed(() => ({
  '--lightbox-origin-x': `${lightboxOrigin.value.x}px`,
  '--lightbox-origin-y': `${lightboxOrigin.value.y}px`,
  '--lightbox-origin-scale': String(lightboxOrigin.value.scale)
}))

const { start: startCursor, stop: stopCursor } = useCustomCursor()

const getFocusableElements = (container: HTMLElement) =>
  [...container.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
  )].filter((el) => !el.hasAttribute('disabled'))

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

const openLightbox = async (index: number, event: Event) => {
  triggerEl = event.currentTarget instanceof HTMLElement ? event.currentTarget : null

  if (triggerEl) {
    const rect = triggerEl.getBoundingClientRect()
    lightboxOrigin.value = {
      x: rect.left + rect.width / 2 - window.innerWidth / 2,
      y: rect.top + rect.height / 2 - window.innerHeight / 2,
      scale: Math.min(1, Math.max(0.08, rect.width / window.innerWidth))
    }
  }

  slideDirection.value = null
  activeIndex.value = index
  setPageInert(true)
  await nextTick()
  lightboxRef.value?.focus()
}

const closeLightbox = async () => {
  activeIndex.value = null
  setPageInert(false)
  await nextTick()
  triggerEl?.focus()
  triggerEl = null
}

const prevItem = () => {
  if (activeIndex.value === null || activeIndex.value === 0) return
  slideDirection.value = 'previous'
  activeIndex.value -= 1
}

const nextItem = () => {
  if (activeIndex.value === null || activeIndex.value >= galleryItems.value.length - 1) return
  slideDirection.value = 'next'
  activeIndex.value += 1
}

const handleKeydown = (event: KeyboardEvent) => {
  if (activeIndex.value === null) return

  trapFocus(event)

  if (event.key === 'Escape') {
    event.preventDefault()
    void closeLightbox()
  }

  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    prevItem()
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    nextItem()
  }
}

const handleLightboxClick = (event: MouseEvent) => {
  if (didSwipe || event.target instanceof HTMLElement && event.target.closest('button')) return
  void closeLightbox()
}

const handleLightboxPointerDown = (event: PointerEvent) => {
  if (event.pointerType === 'touch') touchStartX = event.clientX
}

const handleLightboxPointerUp = (event: PointerEvent) => {
  if (event.pointerType !== 'touch' || touchStartX === null) return

  const distance = event.clientX - touchStartX
  touchStartX = null

  if (Math.abs(distance) < 56) return

  didSwipe = true
  if (distance < 0) nextItem()
  else prevItem()
  window.setTimeout(() => { didSwipe = false }, 0)
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
</script>

<template>
  <div class="gallery-page">
    <div class="gallery-page__intro">
      <p class="gallery-page__welcome">Welcome!</p>
      <p class="gallery-page__bio">
        I create stylized and fantasy-focused 3D characters, combining sculpting, hand-painted texture work, and realtime presentation.
        Selected character art and illustrations by Ali Taha Yapışkan.
        For availability and information, contact me at: <a href="mailto:qaliqtaha@gmail.com">qaliqtaha@gmail.com</a>
      </p>
    </div>

    <div class="gallery-grid">
      <div v-for="(row, rowIndex) in galleryRows" :key="rowIndex" class="gallery-grid__row">
        <button
          v-for="item in row"
          :key="item.id"
          class="gallery-item"
          type="button"
          data-cursor="zoom-in"
          :style="{ '--gallery-ratio': String(item.aspectRatio) }"
          :aria-label="`Open ${item.title}`"
          @click="openLightbox(item.order, $event)"
        >
          <img
            :src="item.src"
            :alt="item.title"
            :loading="item.order < 2 ? 'eager' : 'lazy'"
            :fetchpriority="item.order < 2 ? 'high' : 'auto'"
          >
        </button>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <div
      v-if="activeItem"
      ref="lightboxRef"
      class="project-lightbox project-lightbox--reference"
      data-lenis-prevent
      data-cursor="zoom-out"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      :aria-label="activeItem.title"
      :style="lightboxStyle"
      @click="handleLightboxClick"
      @pointerdown="handleLightboxPointerDown"
      @pointerup="handleLightboxPointerUp"
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
        @click.stop="prevItem"
      >
        <span class="sr-only">Previous image</span>
      </button>

      <figure
        :key="activeItem.id"
        class="project-lightbox__figure project-lightbox__figure--reference"
        :class="slideDirection ? `project-lightbox__figure--${slideDirection}` : null"
      >
        <img :src="activeItem.src" :alt="activeItem.title">
      </figure>

      <button
        v-if="activeIndex !== null && activeIndex < galleryItems.length - 1"
        class="project-lightbox__hit project-lightbox__hit--next"
        type="button"
        data-cursor="right-arrow"
        aria-label="Next image"
        @click.stop="nextItem"
      >
        <span class="sr-only">Next image</span>
      </button>
    </div>
  </Teleport>
</template>
