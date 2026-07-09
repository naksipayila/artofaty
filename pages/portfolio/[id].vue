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
const activeGalleryIndex = ref<number | null>(null)
const activeGalleryImage = computed(() => (
  activeGalleryIndex.value === null ? null : galleryImages[activeGalleryIndex.value]
))
const activeGalleryStyle = computed(() => (
  activeGalleryImage.value ? { '--lightbox-preview': `url(${activeGalleryImage.value})` } : undefined
))

const projectFacts = [
  project.details.client,
  project.category,
  project.details.date,
  project.tools.slice(0, 3).join(', ')
]

let revealObserver: IntersectionObserver | undefined

const openGalleryImage = (index: number) => {
  activeGalleryIndex.value = index
}

const closeGalleryImage = () => {
  activeGalleryIndex.value = null
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

  if (event.key === 'Escape') {
    event.preventDefault()
    closeGalleryImage()
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

const observeDetailReveal = () => {
  const elements = document.querySelectorAll<HTMLElement>('.project-detail-reveal')

  if (!revealObserver) {
    elements.forEach((element) => element.classList.add('is-visible'))
    return
  }

  elements.forEach((element) => revealObserver?.observe(element))
}

useSeoMeta({
  title: project.title,
  description: project.description,
  ogTitle: `${project.title} - ATY`,
  ogDescription: project.description,
  ogImage: project.cover
})

onMounted(() => {
  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            revealObserver?.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.14 }
    )
  }

  observeDetailReveal()
  window.addEventListener('keydown', handleGalleryKeydown)
})

onBeforeUnmount(() => {
  revealObserver?.disconnect()
  window.removeEventListener('keydown', handleGalleryKeydown)
})
</script>

<template>
  <section class="project-detail-hero">
    <div class="project-detail-hero__content project-detail-reveal">
      <NuxtLink class="project-detail-back" to="/portfolio">Back to portfolio</NuxtLink>
      <p class="eyebrow project-detail-kicker">{{ project.year }} / {{ artist.role }}</p>
      <h1>{{ project.title }}</h1>
      <p>{{ project.description }}</p>

      <aside class="project-detail-facts" aria-label="Project information">
        <span v-for="fact in projectFacts" :key="fact">{{ fact }}</span>
      </aside>
    </div>

  </section>

  <section class="section project-detail-content-section project-detail-body">
    <article class="project-copy-block project-detail-overview project-detail-reveal" style="--stagger: 2">
      <p class="eyebrow">Overview</p>
      <p>{{ project.details.overview }}</p>
    </article>

    <div class="project-detail-gallery project-detail-reveal" style="--stagger: 3">
      <div class="project-detail-gallery__grid">
        <figure
          v-for="(image, index) in galleryImages"
          :key="image"
          class="project-detail-gallery__item"
          :class="{ 'project-detail-gallery__item--featured': index === 0 }"
          role="button"
          tabindex="0"
          :aria-label="`Open ${project.title} gallery image ${index + 1}`"
          @click="openGalleryImage(index)"
          @keydown.enter.prevent="openGalleryImage(index)"
          @keydown.space.prevent="openGalleryImage(index)"
        >
          <img :src="image" :alt="`${project.title} gallery image ${index + 1}`" loading="lazy">
        </figure>
      </div>
    </div>
  </section>

  <section class="section project-detail-share-section project-detail-share project-detail-reveal">
    <div class="project-detail-nav">
      <NuxtLink :to="`/portfolio/${previousProject.id}#banner`" class="button">Previous</NuxtLink>
      <NuxtLink :to="`/portfolio/${nextProject.id}#banner`" class="button button--primary">Next</NuxtLink>
    </div>
  </section>

  <Teleport to="body">
    <Transition name="project-lightbox">
      <div
        v-if="activeGalleryImage"
        class="project-lightbox"
        data-lenis-prevent
        :style="activeGalleryStyle"
        role="dialog"
        aria-modal="true"
        :aria-label="`${project.title} enlarged gallery image`"
        @click.self="closeGalleryImage"
      >
        <div class="project-lightbox__bar project-lightbox__bar--detail">
          <button class="project-lightbox__close" type="button" aria-label="Close" @click="closeGalleryImage">×</button>
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
          <Transition name="project-lightbox-image" mode="out-in">
            <img
              :key="activeGalleryImage"
              :src="activeGalleryImage"
              :alt="`${project.title} enlarged gallery image ${activeGalleryIndex === null ? '' : activeGalleryIndex + 1}`"
            >
          </Transition>
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

        <div v-if="galleryImages.length > 1" class="project-lightbox__thumbs" aria-label="Gallery thumbnails">
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
    </Transition>
  </Teleport>
</template>
