<script setup lang="ts">
import { artist } from '~/data/portfolio'

const mailHref = `mailto:${artist.email}`

useSeoMeta({
  title: 'About',
  description: `${artist.name} is a 3D Character Artist focused on stylized characters, hand-painted textures, and realtime portfolio presentation.`
})
</script>

<template>
  <section class="page-hero page-hero--about">
    <div class="page-hero__inner">
      <div class="page-hero__copy page-hero__copy--about">
        <p class="eyebrow">About</p>
        <h1>Character art with clean shape language.</h1>
        <p>
          {{ artist.name }} is a {{ artist.role }} based in {{ artist.location }}, focused on stylized characters, readable silhouettes, hand-painted material work, and realtime presentation.
        </p>
      </div>

      <div class="button-row">
        <a class="button button--primary" :href="artist.artstation" target="_blank" rel="noreferrer">ArtStation</a>
        <a class="button" :href="mailHref">Email</a>
      </div>
    </div>
  </section>
</template>
