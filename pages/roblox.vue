<script setup lang="ts">
import { robloxProjects } from '~/data/portfolio'
import { type GalleryLightboxItem, useGalleryLightbox } from '~/composables/useGalleryLightbox'

type RobloxGalleryItem = GalleryLightboxItem & {
  id: string
  order: number
}

const robloxGalleryItems: RobloxGalleryItem[] = robloxProjects.slice(0, 14).map((project, order) => ({
  id: project.id,
  src: project.cover,
  title: project.title,
  order,
  media: project.video
    ? [{ src: project.video, type: 'video' as const }]
    : [{ src: project.cover, type: 'image' as const }]
}))
const featuredRobloxGalleryItems = robloxGalleryItems.slice(0, 6)
const additionalRobloxGalleryItems = robloxGalleryItems.slice(6)

useSeoMeta({
  title: 'Roblox Portfolio',
  description: 'Roblox character and creature art by Ali Taha Yapışkan.',
  ogTitle: 'Roblox Portfolio | ATY',
  ogDescription: 'Roblox character and creature art by Ali Taha Yapışkan.'
})

const {
  activeItem,
  activeMedia,
  activeMediaIndex,
  closeLightbox,
  handleLightboxClick,
  handleLightboxTouchEnd,
  handleLightboxTouchStart,
  hasNextMedia,
  hasPreviousMedia,
  lightboxRef,
  lightboxStyle,
  nextMedia,
  openLightbox,
  previousMedia
} = useGalleryLightbox(robloxGalleryItems)
</script>

<template>
  <div class="roblox-page">
    <div class="gallery-page__intro">
      <p class="gallery-page__bio">
        I create stylized characters and creatures for Roblox, focusing on expressive silhouettes, readable forms, and game-ready presentation.
        A selection of character art created for the Roblox platform.
      </p>
    </div>

    <div class="roblox-gallery">
      <button
        v-for="item in featuredRobloxGalleryItems"
        :key="item.id"
        class="gallery-item roblox-gallery__item"
        type="button"
        data-cursor="zoom-in"
        :aria-label="`Open ${item.title}`"
        @click="openLightbox(item, $event)"
      >
        <img :src="item.src" :alt="item.title" :loading="item.order < 2 ? 'eager' : 'lazy'">
        <span class="gallery-item__title" aria-hidden="true">{{ item.title }}</span>
      </button>
    </div>

    <div class="roblox-gallery roblox-gallery--secondary">
      <button
        v-for="item in additionalRobloxGalleryItems"
        :key="item.id"
        class="gallery-item roblox-gallery__item"
        type="button"
        data-cursor="zoom-in"
        :aria-label="`Open ${item.title}`"
        @click="openLightbox(item, $event)"
      >
        <img :src="item.src" :alt="item.title" loading="lazy">
        <span class="gallery-item__title" aria-hidden="true">{{ item.title }}</span>
      </button>
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

      <figure class="project-lightbox__figure project-lightbox__figure--reference">
        <button
          v-if="hasPreviousMedia"
          class="project-lightbox__hit project-lightbox__hit--previous"
          type="button"
          data-cursor="left-arrow"
          aria-label="Previous item"
          @click.stop="previousMedia"
        >
          <span class="sr-only">Previous item</span>
        </button>

        <video
          v-if="activeMedia?.type === 'video'"
          data-cursor="zoom-out"
          :src="activeMedia.src"
          autoplay
          controls
          loop
          playsinline
        />
        <img v-else-if="activeMedia" :src="activeMedia.src" :alt="activeItem.title">

        <button
          v-if="hasNextMedia"
          class="project-lightbox__hit project-lightbox__hit--next"
          type="button"
          data-cursor="right-arrow"
          aria-label="Next item"
          @click.stop="nextMedia"
        >
          <span class="sr-only">Next item</span>
        </button>
      </figure>
    </div>
  </Teleport>
</template>
