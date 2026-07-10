<script setup lang="ts">
import { artist, projects } from '~/data/portfolio'

const homeHeroImage = 'https://cdnb.artstation.com/p/assets/marmosets/images/087/982/587/large/ali-taha-yapiskan-mview-image20250513-12-1yyv867.jpg?1747163415'
const homeFeaturedProject = projects.find((project) => project.id === 'miss-fortune') ?? projects[0]

useSeoMeta({
  title: 'Home',
  titleTemplate: '%s',
  ogTitle: 'ATY - 3D Character Artist Portfolio',
  description: 'Personal portfolio of Ali Taha Yapışkan, a 3D Character Artist focused on stylized characters, hand-painted textures, and realtime presentation.',
  ogDescription: 'Personal portfolio of Ali Taha Yapışkan, a 3D Character Artist focused on stylized characters, hand-painted textures, and realtime presentation.',
  ogImage: homeHeroImage
})
</script>

<template>
  <section class="hero">
    <div class="hero__content">
      <h1>Characters with sculpted attitude.</h1>

      <div class="hero__copy">
        <div class="hero__meta">
          <span>{{ artist.brand }}</span>
          <span>Available for {{ artist.availability.join(' / ') }}</span>
        </div>
        <p>
          I create stylized and fantasy-focused 3D characters, combining sculpting, hand-painted texture work, and realtime presentation for game art portfolios and production-ready visuals.
        </p>
      </div>

      <div class="hero__actions">
        <NuxtLink class="button button--primary" to="/portfolio">View portfolio</NuxtLink>
        <a class="button" :href="`mailto:${artist.email}`">Contact by mail</a>
      </div>
    </div>

    <div class="hero__visual hero__visual--model" :aria-label="`${homeFeaturedProject.title} realtime 3D character model`">
      <HomeModelViewer
        model-path="models/MissFortune_low.fbx"
        :poster-path="homeHeroImage"
        :label="`${homeFeaturedProject.title} realtime 3D character model`"
      />
      <div class="hero__visual-card">
        <div>
          <p class="eyebrow">Realtime model</p>
          <h2>{{ homeFeaturedProject.title }}</h2>
        </div>
        <NuxtLink class="button" :to="`/portfolio/${homeFeaturedProject.id}`">Open Project</NuxtLink>
      </div>
    </div>
  </section>
</template>
