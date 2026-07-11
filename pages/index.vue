<script setup lang="ts">
import { artist, projects } from '~/data/portfolio'
import { type GalleryLightboxItem, useGalleryLightbox } from '~/composables/useGalleryLightbox'

type GalleryItem = GalleryLightboxItem & {
  id: string
  coverCrop?: string
  desktopSrc?: string
  order: number
  hasGallery: boolean
}

const galleryItems: GalleryItem[] = projects.map((project, order) => ({
  id: project.id,
  src: project.cover || project.images[0],
  title: project.title,
  coverCrop: project.coverCrop,
  desktopSrc: project.desktopCover,
  order,
  hasGallery: project.images.length > 1
}))

const galleryRows = (() => {
  const rows: GalleryItem[][] = []

  for (let index = 0; index < galleryItems.length; index += 3) {
    rows.push(galleryItems.slice(index, index + 3))
  }

  return rows
})()

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

const {
  activeItem,
  activeMedia,
  activeMediaIndex,
  closeLightbox,
  handleLightboxClick,
  handleLightboxTouchEnd,
  handleLightboxTouchStart,
  lightboxRef,
  lightboxStyle,
  openLightbox
} = useGalleryLightbox()
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
            <path d="M0 17.723l2.027 3.505h.001a2.424 2.424 0 0 0 2.164 1.333h13.457l-2.792-4.838H0zm24 .025c0-.484-.143-.935-.388-1.314L15.728 2.728a2.424 2.424 0 0 0-2.142-1.289H9.419L21.598 22.54l1.92-3.325c.378-.637.482-.919.482-1.467zm-11.129-3.462L7.428 4.858l-5.444 9.428h10.887z" />
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
            :style="{ '--gallery-focus': item.coverCrop || 'center' }"
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
            :style="{ '--gallery-focus': item.coverCrop || 'center' }"
            :aria-label="`Open ${item.title}`"
            @click="openLightbox(item, $event)"
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
      @touchstart.passive="handleLightboxTouchStart"
      @touchend="handleLightboxTouchEnd"
    >
      <button class="project-lightbox__dismiss" type="button" aria-label="Close image" @click.stop="closeLightbox">
        <span class="sr-only">Close image</span>
      </button>

      <button
        v-if="activeMediaIndex > 0"
        class="project-lightbox__hit project-lightbox__hit--previous"
        type="button"
        data-cursor="left-arrow"
        aria-label="Previous media"
        @click.stop="activeMediaIndex -= 1"
      >
        <span class="sr-only">Previous media</span>
      </button>

      <figure class="project-lightbox__figure project-lightbox__figure--reference">
        <video
          v-if="activeMedia?.type === 'video'"
          :src="activeMedia.src"
          autoplay
          controls
          loop
          playsinline
        />
        <img v-else-if="activeMedia" :src="activeMedia.src" :alt="activeItem.title">
      </figure>

      <button
        v-if="activeMediaIndex < (activeItem.media?.length || 1) - 1"
        class="project-lightbox__hit project-lightbox__hit--next"
        type="button"
        data-cursor="right-arrow"
        aria-label="Next media"
        @click.stop="activeMediaIndex += 1"
      >
        <span class="sr-only">Next media</span>
      </button>
    </div>
  </Teleport>
</template>
