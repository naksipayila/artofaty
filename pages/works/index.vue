<script setup lang="ts">
import { projects, robloxProjects } from '~/data/portfolio'

type GalleryItem = {
  id: string
  src: string
  video?: string
  title: string
  w: number
  h: number
  span: number
  projectId: string
}

const galleryItems = computed<GalleryItem[]>(() => {
  const items: GalleryItem[] = []

  for (const project of projects) {
    const allImages = project.images.length > 0 ? project.images : [project.cover]
    for (let i = 0; i < allImages.length; i++) {
      const ratioStr = project.imageAspectRatios[i] || '1 / 1'
      const [w, h] = ratioStr.split('/').map(Number)
      const span = (w && h && w / h > 1.4) ? 2 : 1
      items.push({
        id: `${project.id}-${i}`,
        src: allImages[i],
        title: project.title,
        w: w || 1,
        h: h || 1,
        span,
        projectId: project.id
      })
    }
  }

  for (const rp of robloxProjects) {
    items.push({
      id: rp.id,
      src: rp.image || rp.cover,
      video: rp.video,
      title: rp.title,
      w: 1,
      h: 1,
      span: 1,
      projectId: rp.id
    })
  }

  return items
})

useSeoMeta({
  title: 'Works',
  description: 'Character art, illustrations, and 3D projects by Ali Taha Yapışkan.',
  ogTitle: 'ATY',
  ogDescription: 'Character art, illustrations, and 3D projects by Ali Taha Yapışkan.',
})

const activeIndex = ref<number | null>(null)
const lightboxRef = ref<HTMLElement | null>(null)
const closeButtonRef = ref<HTMLButtonElement | null>(null)
let triggerEl: HTMLElement | null = null
const prefersReducedMotion = ref(false)

const activeItem = computed(() =>
  activeIndex.value === null ? null : galleryItems.value[activeIndex.value] ?? null
)

const { start: startCursor, stop: stopCursor } = useCustomCursor()

const getFocusableElements = (container: HTMLElement) =>
  [...container.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
  )].filter((el) => !el.hasAttribute('disabled'))

const setPageInert = (v: boolean) => {
  document.querySelector('.site-shell')?.toggleAttribute('inert', v)
}

const trapFocus = (e: KeyboardEvent) => {
  if (e.key !== 'Tab' || !lightboxRef.value) return
  const els = getFocusableElements(lightboxRef.value)
  if (!els.length) return
  const first = els[0]
  const last = els[els.length - 1]
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
}

const openLightbox = async (index: number, event: MouseEvent) => {
  triggerEl = event.currentTarget instanceof HTMLElement ? event.currentTarget : null
  activeIndex.value = index
  setPageInert(true)
  await nextTick()
  closeButtonRef.value?.focus()
}

const closeLightbox = async () => {
  activeIndex.value = null
  setPageInert(false)
  await nextTick()
  triggerEl?.focus()
  triggerEl = null
}

const prevItem = () => {
  if (activeIndex.value === null) return
  activeIndex.value = (activeIndex.value - 1 + galleryItems.value.length) % galleryItems.value.length
}

const nextItem = () => {
  if (activeIndex.value === null) return
  activeIndex.value = (activeIndex.value + 1) % galleryItems.value.length
}

const handleKeydown = (e: KeyboardEvent) => {
  if (activeIndex.value === null) return
  trapFocus(e)
  if (e.key === 'Escape') { e.preventDefault(); void closeLightbox() }
  if (e.target instanceof HTMLVideoElement || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
  if (e.key === 'ArrowLeft') { e.preventDefault(); prevItem() }
  if (e.key === 'ArrowRight') { e.preventDefault(); nextItem() }
}

let reducedMotionQuery: MediaQueryList | null = null
let handleChange: ((e: MediaQueryListEvent) => void) | null = null

onMounted(() => {
  reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion.value = reducedMotionQuery.matches
  handleChange = (e) => { prefersReducedMotion.value = e.matches }
  reducedMotionQuery.addEventListener('change', handleChange)
  window.addEventListener('keydown', handleKeydown)
  startCursor()
})

onBeforeUnmount(() => {
  setPageInert(false)
  stopCursor()
  reducedMotionQuery?.removeEventListener('change', handleChange!)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="gallery-page">
    <div class="gallery-page__intro">
      <p class="gallery-page__welcome">Welcome!</p>
      <p class="gallery-page__bio">
        I create stylized and fantasy-focused 3D characters, combining sculpting, hand-painted texture work, and realtime presentation.
        Selected character art, illustrations, and Roblox projects by Ali Taha Yapışkan.
        For availability and information, contact me at: <a :href="`mailto:qaliqtaha@gmail.com`">qaliqtaha@gmail.com</a>
      </p>
    </div>

    <div class="gallery-masonry">
      <button
        v-for="(item, index) in galleryItems"
        :key="item.id"
        class="gallery-item"
        :class="{ 'gallery-item--wide': item.span === 2 }"
        type="button"
        :aria-label="`Open ${item.title}`"
        @click="openLightbox(index, $event)"
      >
        <img
          :src="item.src"
          :alt="item.title"
          :loading="index < 4 ? 'eager' : 'lazy'"
          :fetchpriority="index < 2 ? 'high' : 'auto'"
        >
      </button>
    </div>
  </div>

  <Teleport to="body">
    <div
      v-if="activeItem"
      ref="lightboxRef"
      class="project-lightbox"
      data-lenis-prevent
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      :aria-label="activeItem.title"
      @click.self="closeLightbox"
    >
      <div class="project-lightbox__bar project-lightbox__bar--detail">
        <span class="project-lightbox__count" role="status">
          {{ String((activeIndex ?? 0) + 1).padStart(2, '0') }} / {{ String(galleryItems.length).padStart(2, '0') }}
        </span>
        <button ref="closeButtonRef" class="project-lightbox__close" type="button" aria-label="Close" @click="closeLightbox">&times;</button>
      </div>

      <button
        v-if="galleryItems.length > 1"
        class="project-lightbox__nav project-lightbox__nav--prev"
        type="button"
        aria-label="Previous"
        @click="prevItem"
      >
        <span aria-hidden="true">&larr;</span>
      </button>

      <figure class="project-lightbox__figure project-lightbox__figure--detail">
        <video
          v-if="activeItem.video"
          :key="activeItem.video"
          class="project-lightbox__video"
          :poster="activeItem.src"
          controls
          :autoplay="!prefersReducedMotion"
          muted
          :loop="!prefersReducedMotion"
          playsinline
        >
          <source :src="activeItem.video" type="video/mp4">
        </video>
        <img v-else :src="activeItem.src" :alt="activeItem.title">
      </figure>

      <button
        v-if="galleryItems.length > 1"
        class="project-lightbox__nav project-lightbox__nav--next"
        type="button"
        aria-label="Next"
        @click="nextItem"
      >
        <span aria-hidden="true">&rarr;</span>
      </button>
    </div>
  </Teleport>
</template>
