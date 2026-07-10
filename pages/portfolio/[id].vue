<script setup lang="ts">
import { artist, projects } from '~/data/portfolio'

const route = useRoute()
const projectId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
const projectIndex = projects.findIndex((item) => item.id === projectId)
const foundProject = projects[projectIndex]

if (!foundProject) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found' })
}

const project = foundProject
const previousProject = projects[(projectIndex - 1 + projects.length) % projects.length]
const nextProject = projects[(projectIndex + 1) % projects.length]

const galleryImages = project.images.length ? project.images : [project.cover]
const heroImage = project.heroImage ?? galleryImages[0]
const activeGalleryIndex = ref<number | null>(null)
const galleryLightboxRef = ref<HTMLElement | null>(null)
const galleryCloseButtonRef = ref<HTMLButtonElement | null>(null)
const galleryThumbsRef = ref<HTMLElement | null>(null)
let galleryTrigger: HTMLElement | null = null
const activeGalleryImage = computed(() => (
  activeGalleryIndex.value === null ? null : galleryImages[activeGalleryIndex.value]
))
const activeGalleryStyle = computed(() => (
  activeGalleryImage.value ? { '--lightbox-preview': `url(${activeGalleryImage.value})` } : undefined
))

const projectFacts = [
  { label: 'Client', value: project.details.client },
  { label: 'Category', value: project.category },
  { label: 'Date', value: project.details.date },
  { label: 'Tools', value: project.tools.slice(0, 3).join(', ') }
]

const getFocusableElements = (container: HTMLElement) => (
  [...container.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
  )].filter((element) => !element.hasAttribute('disabled'))
)

const setPageInert = (isInert: boolean) => {
  document.querySelector('.site-shell')?.toggleAttribute('inert', isInert)
}

const trapGalleryLightboxFocus = (event: KeyboardEvent) => {
  if (event.key !== 'Tab' || !galleryLightboxRef.value) return

  const focusableElements = getFocusableElements(galleryLightboxRef.value)
  if (!focusableElements.length) return

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement.focus()
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement.focus()
  }
}

const openGalleryImage = async (index: number, event?: MouseEvent) => {
  galleryTrigger = event?.currentTarget instanceof HTMLElement ? event.currentTarget : galleryTrigger
  activeGalleryIndex.value = index
  setPageInert(true)
  await nextTick()
  galleryCloseButtonRef.value?.focus()
}

const closeGalleryImage = async () => {
  activeGalleryIndex.value = null
  setPageInert(false)
  await nextTick()
  galleryTrigger?.focus()
  galleryTrigger = null
}

const showPreviousGalleryImage = () => {
  if (activeGalleryIndex.value === null) return
  activeGalleryIndex.value = (activeGalleryIndex.value - 1 + galleryImages.length) % galleryImages.length
}

const showNextGalleryImage = () => {
  if (activeGalleryIndex.value === null) return
  activeGalleryIndex.value = (activeGalleryIndex.value + 1) % galleryImages.length
}

const handleGalleryKeydown = (event: KeyboardEvent) => {
  if (activeGalleryIndex.value === null) return

  trapGalleryLightboxFocus(event)

  if (event.key === 'Escape') {
    event.preventDefault()
    void closeGalleryImage()
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    showPreviousGalleryImage()
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault()
    showNextGalleryImage()
  }
}

useSeoMeta({
  title: project.title,
  description: project.description,
  ogTitle: `${project.title} - ATY`,
  ogDescription: project.description,
  ogImage: project.cover
})

onMounted(() => {
  window.addEventListener('keydown', handleGalleryKeydown)
})

onBeforeUnmount(() => {
  setPageInert(false)
  window.removeEventListener('keydown', handleGalleryKeydown)
})

watch(activeGalleryIndex, async (index) => {
  if (index === null) return

  await nextTick()
  galleryThumbsRef.value?.querySelector('.project-lightbox__thumb--active')?.scrollIntoView({ block: 'nearest', inline: 'center' })
})
</script>

<template>
  <section class="project-detail-hero">
    <div class="project-detail-hero__content project-detail-reveal">
      <NuxtLink class="project-detail-back" to="/portfolio">Back to portfolio</NuxtLink>
      <p class="eyebrow project-detail-kicker">{{ project.year }} / {{ artist.role }}</p>
      <h1>{{ project.title }}</h1>
      <p>{{ project.description }}</p>

      <dl class="project-detail-facts" aria-label="Project information">
        <div v-for="fact in projectFacts" :key="fact.label">
          <dt>{{ fact.label }}</dt>
          <dd>{{ fact.value }}</dd>
        </div>
      </dl>
    </div>

    <figure class="project-detail-hero__visual project-detail-reveal" style="--stagger: 1">
      <img :src="heroImage" alt="" :style="{ objectPosition: project.heroCrop, transformOrigin: project.heroOrigin, '--hero-scale': project.heroScale }">
    </figure>
  </section>

  <section class="section project-detail-content-section project-detail-body">
    <article class="project-copy-block project-detail-overview project-detail-reveal" style="--stagger: 2">
      <h2 class="eyebrow">Overview</h2>
      <p>{{ project.details.overview }}</p>
    </article>

    <div class="project-detail-gallery project-detail-reveal" style="--stagger: 3">
      <div class="project-detail-gallery__grid">
        <figure
          v-for="(image, index) in galleryImages"
          :key="image"
          class="project-detail-gallery__item"
          :class="{ 'project-detail-gallery__item--featured': index === 0 }"
          :style="{ '--gallery-aspect-ratio': project.imageAspectRatios[index] }"
        >
          <button
            class="project-detail-gallery__button"
            type="button"
            :aria-label="`Open ${project.title} image ${index + 1}`"
            aria-haspopup="dialog"
            @click="openGalleryImage(index, $event)"
          >
            <img :src="image" alt="" loading="lazy">
          </button>
        </figure>
      </div>
    </div>
  </section>

  <nav class="section project-detail-share-section project-detail-share project-detail-reveal" aria-label="Project navigation">
    <div class="project-detail-nav">
      <NuxtLink :to="`/portfolio/${previousProject.id}`" class="button">Previous: {{ previousProject.title }}</NuxtLink>
      <NuxtLink :to="`/portfolio/${nextProject.id}`" class="button button--primary">Next: {{ nextProject.title }}</NuxtLink>
    </div>
  </nav>

  <Teleport to="body">
      <div
        v-if="activeGalleryImage"
        ref="galleryLightboxRef"
        class="project-lightbox"
        data-lenis-prevent
        :style="activeGalleryStyle"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        :aria-label="`${project.title} enlarged gallery image`"
        @click.self="closeGalleryImage"
      >
        <div class="project-lightbox__bar project-lightbox__bar--detail">
          <button ref="galleryCloseButtonRef" class="project-lightbox__close" type="button" aria-label="Close" @click="closeGalleryImage">×</button>
          <span class="sr-only" role="status">Image {{ activeGalleryIndex === null ? '' : activeGalleryIndex + 1 }} of {{ galleryImages.length }}</span>
        </div>

        <button
          v-if="galleryImages.length > 1"
          class="project-lightbox__nav project-lightbox__nav--prev"
          type="button"
          aria-label="Previous image"
          @click="showPreviousGalleryImage"
        >
          <span aria-hidden="true">←</span>
        </button>

        <figure class="project-lightbox__figure project-lightbox__figure--detail">
            <img
              :key="activeGalleryImage"
              :src="activeGalleryImage"
              :alt="`${project.title} image ${activeGalleryIndex === null ? '' : activeGalleryIndex + 1}`"
            >
        </figure>

        <button
          v-if="galleryImages.length > 1"
          class="project-lightbox__nav project-lightbox__nav--next"
          type="button"
          aria-label="Next image"
          @click="showNextGalleryImage"
        >
          <span aria-hidden="true">→</span>
        </button>

        <div v-if="galleryImages.length > 1" ref="galleryThumbsRef" class="project-lightbox__thumbs" aria-label="Gallery thumbnails">
          <button
            v-for="(image, index) in galleryImages"
            :key="`${image}-thumb`"
            class="project-lightbox__thumb"
            :class="{ 'project-lightbox__thumb--active': activeGalleryIndex === index }"
            type="button"
            :aria-current="activeGalleryIndex === index ? 'true' : undefined"
            :aria-label="`Open ${project.title} gallery image ${index + 1}`"
            @click="openGalleryImage(index)"
          >
            <img :src="image" alt="" loading="lazy">
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
          </button>
        </div>
      </div>
  </Teleport>
</template>
