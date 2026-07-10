<script setup lang="ts">
import { projects } from '~/data/portfolio'

const route = useRoute()
const project = computed(() => projects.find((entry) => entry.id === route.params.id))

if (!project.value) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found' })
}

const images = computed(() => project.value?.images.length ? project.value.images : [project.value?.cover || ''])
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
      return { src, index, layout: format === 'portrait' ? 'lead-portrait' : 'lead' }
    }

    if (format === 'panorama') {
      pairOpen = false
      return { src, index, layout: 'panorama' }
    }

    if (pairOpen) {
      pairOpen = false
      return { src, index, layout: 'pair' }
    }

    const nextRatio = ratios[index + 1]
    const nextFormat = nextRatio === undefined
      ? null
      : nextRatio > 2 ? 'panorama' : nextRatio < 0.85 ? 'portrait' : nextRatio > 1.25 ? 'landscape' : 'square'

    if (format === nextFormat) {
      pairOpen = true
      return { src, index, layout: 'pair' }
    }

    return { src, index, layout: `solo-${format}` }
  })
})
const activeIndex = ref<number | null>(null)
const lightboxRef = ref<HTMLElement | null>(null)
let triggerEl: HTMLElement | null = null

useSeoMeta({
  title: project.value.title,
  description: project.value.description,
  ogTitle: project.value.title,
  ogDescription: project.value.description
})

const activeImage = computed(() =>
  activeIndex.value === null ? null : images.value[activeIndex.value] ?? null
)

const { start: startCursor, stop: stopCursor } = useCustomCursor()

const setPageInert = (value: boolean) => {
  document.querySelector('.site-shell')?.toggleAttribute('inert', value)
}

const openLightbox = async (index: number, event: Event) => {
  triggerEl = event.currentTarget instanceof HTMLElement ? event.currentTarget : null
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

const prevImage = () => {
  if (activeIndex.value === null || activeIndex.value === 0) return
  activeIndex.value -= 1
}

const nextImage = () => {
  if (activeIndex.value === null || activeIndex.value >= images.value.length - 1) return
  activeIndex.value += 1
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
  if (event.target instanceof HTMLElement && event.target.closest('button')) return
  void closeLightbox()
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
        :aria-label="`Open ${project.title} image ${image.index + 1}`"
        @click="openLightbox(image.index, $event)"
      >
        <img :src="image.src" :alt="`${project.title} ${image.index + 1}`" :loading="image.index === 0 ? 'eager' : 'lazy'">
      </button>
    </div>
  </article>

  <Teleport to="body">
    <div
      v-if="activeImage"
      ref="lightboxRef"
      class="project-lightbox project-lightbox--reference"
      data-lenis-prevent
      data-cursor="zoom-out"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      :aria-label="project.title"
      style="--lightbox-origin-x: 0px; --lightbox-origin-y: 0px; --lightbox-origin-scale: 0.96"
      @click="handleLightboxClick"
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

      <figure class="project-lightbox__figure project-lightbox__figure--reference">
        <img :src="activeImage" :alt="project.title">
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
