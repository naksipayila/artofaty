<script setup lang="ts">
import { artist, projects } from '~/data/portfolio'

type GalleryItem = {
  id: string
  src: string
  title: string
  aspectRatio: number
  coverCrop?: string
  desktopSrc?: string
  order: number
  hasGallery: boolean
}

const toAspectRatio = (value: string) => {
  const [width, height] = value.split('/').map(Number)
  return width && height ? width / height : 1
}

const galleryItems = computed<GalleryItem[]>(() => projects.map((project, order) => ({
  id: project.id,
  src: project.cover || project.images[0],
  title: project.title,
  aspectRatio: toAspectRatio(project.imageAspectRatios[0] || '1 / 1'),
  coverCrop: project.coverCrop,
  desktopSrc: project.desktopCover,
  order,
  hasGallery: project.images.length > 1
})))

const galleryRows = computed(() => {
  const rows: GalleryItem[][] = []

  for (let index = 0; index < galleryItems.value.length; index += 3) {
    rows.push(galleryItems.value.slice(index, index + 3))
  }

  return rows
})

const socialLinks = [
  { name: 'Instagram', href: artist.instagram, icon: 'instagram' },
  { name: 'LinkedIn', href: artist.linkedin, icon: 'linkedin' },
  { name: 'ArtStation', href: artist.artstation, icon: 'artstation' },
  { name: 'YouTube', href: artist.youtube, icon: 'youtube' }
]

useSeoMeta({
  title: 'Works',
  description: 'Character art and illustrations by Ali Taha Yapışkan.',
  ogTitle: 'ATY',
  ogDescription: 'Character art and illustrations by Ali Taha Yapışkan.'
})

const activeIndex = ref<number | null>(null)
const lightboxRef = ref<HTMLElement | null>(null)
const lightboxOrigin = ref({ x: 0, y: 0, scale: 0.16 })
let triggerEl: HTMLElement | null = null

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

const handleKeydown = (event: KeyboardEvent) => {
  if (activeIndex.value === null) return
  trapFocus(event)

  if (event.key === 'Escape') {
    event.preventDefault()
    void closeLightbox()
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
  <div class="gallery-page">
    <div class="gallery-page__intro">
      <p class="gallery-page__bio">
        I create stylized and fantasy-focused 3D characters, combining sculpting, hand-painted texture work, and realtime presentation.
        Selected character art and illustrations by Ali Taha Yapışkan.
      </p>

      <nav class="gallery-page__socials" aria-label="Social media">
        <a
          v-for="social in socialLinks"
          :key="social.name"
          class="gallery-page__social-link"
          :href="social.href"
          :aria-label="social.name"
          target="_blank"
          rel="noreferrer"
        >
          <svg v-if="social.icon === 'instagram'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.3" cy="6.7" r="0.9" fill="currentColor" stroke="none" />
          </svg>
          <svg v-else-if="social.icon === 'linkedin'" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M6.1 8.3H3.2V20h2.9V8.3ZM4.65 3.6A1.7 1.7 0 1 0 4.7 7a1.7 1.7 0 0 0-.05-3.4ZM20.8 13.3c0-3.53-1.88-5.17-4.4-5.17-2.03 0-2.94 1.12-3.45 1.9V8.3H10V20h2.95v-5.8c0-1.53.3-3.02 2.18-3.02 1.85 0 1.87 1.73 1.87 3.12V20H20.8v-6.7Z" />
          </svg>
          <svg v-else-if="social.icon === 'artstation'" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8.4 3 2 14.2h9.7L8.4 3Zm4.7 8.2L10.3 16h10L13.1 3.4v7.8ZM2 17.5l2.4 3.5h15.1l1.9-3.5H2Z" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M21.58 7.19a2.96 2.96 0 0 0-2.08-2.1C17.67 4.6 12 4.6 12 4.6s-5.67 0-7.5.49a2.96 2.96 0 0 0-2.08 2.1A31.2 31.2 0 0 0 2 12a31.2 31.2 0 0 0 .42 4.81 2.96 2.96 0 0 0 2.08 2.1c1.83.49 7.5.49 7.5.49s5.67 0 7.5-.49a2.96 2.96 0 0 0 2.08-2.1A31.2 31.2 0 0 0 22 12a31.2 31.2 0 0 0-.42-4.81ZM10.2 15.1V8.9l5.2 3.1-5.2 3.1Z" />
          </svg>
        </a>
      </nav>
    </div>

    <div class="gallery-grid">
      <div v-for="(row, rowIndex) in galleryRows" :key="rowIndex" class="gallery-grid__row">
        <template v-for="item in row" :key="item.id">
          <NuxtLink
            v-if="item.hasGallery"
            class="gallery-item gallery-item--project"
            :style="{ '--gallery-ratio': String(item.aspectRatio), '--gallery-focus': item.coverCrop || 'center' }"
            :to="`/works/${item.id}`"
            :aria-label="`View ${item.title}`"
            >
              <picture>
                <source v-if="item.desktopSrc" :srcset="item.desktopSrc" media="(min-width: 761px)">
                <img
                  :src="item.src"
                  :alt="item.title"
                  :loading="item.order < 2 ? 'eager' : 'lazy'"
                  :fetchpriority="item.order < 2 ? 'high' : 'auto'"
                >
              </picture>
              <span class="gallery-item__title" aria-hidden="true">{{ item.title }}</span>
            </NuxtLink>

          <button
            v-else
            class="gallery-item"
            type="button"
            data-cursor="zoom-in"
            :style="{ '--gallery-ratio': String(item.aspectRatio), '--gallery-focus': item.coverCrop || 'center' }"
            :aria-label="`Open ${item.title}`"
            @click="openLightbox(item.order, $event)"
            >
              <picture>
                <source v-if="item.desktopSrc" :srcset="item.desktopSrc" media="(min-width: 761px)">
                <img :src="item.src" :alt="item.title">
              </picture>
              <span class="gallery-item__title" aria-hidden="true">{{ item.title }}</span>
            </button>
        </template>
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
    >
      <button class="project-lightbox__dismiss" type="button" aria-label="Close image" @click.stop="closeLightbox">
        <span class="sr-only">Close image</span>
      </button>

      <figure class="project-lightbox__figure project-lightbox__figure--reference">
        <img :src="activeItem.src" :alt="activeItem.title">
      </figure>
    </div>
  </Teleport>
</template>
