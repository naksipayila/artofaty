<script setup lang="ts">
import { artist, projects } from '~/data/portfolio'

const homeHeroImage = 'https://cdnb.artstation.com/p/assets/marmosets/images/087/982/587/large/ali-taha-yapiskan-mview-image20250513-12-1yyv867.jpg?1747163415'
const homeFeaturedProject = projects.find((project) => project.id === 'miss-fortune') ?? projects[0]

useSeoMeta({
  title: '3D Character Artist Portfolio',
  ogTitle: 'ATY - 3D Character Artist Portfolio',
  description: 'Personal portfolio of Ali Taha Yapışkan, a 3D Character Artist focused on stylized characters, hand-painted textures, and realtime presentation.',
  ogDescription: 'Personal portfolio of Ali Taha Yapışkan, a 3D Character Artist focused on stylized characters, hand-painted textures, and realtime presentation.',
  ogImage: homeHeroImage
})

const process = [
  {
    title: 'Sculpt',
    text: 'Building readable anatomy, expressive silhouettes, and stylized forms in ZBrush before moving into production.'
  },
  {
    title: 'Retopo',
    text: 'Preparing clean game-ready topology and UVs with a focus on deformation, texture space, and presentation needs.'
  },
  {
    title: 'Texture',
    text: 'Painting materials, color hierarchy, and surface detail with hand-painted or PBR workflows depending on the character.'
  },
  {
    title: 'Present',
    text: 'Rendering final shots, clay views, wireframes, and realtime previews that clearly communicate the character work.'
  }
]
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
      <ClientOnly>
        <HomeModelViewer model-path="models/MissFortune_low.fbx" :label="`${homeFeaturedProject.title} realtime 3D character model`" />
        <template #fallback>
          <div class="home-model-viewer home-model-viewer--loading">
            <div class="home-model-viewer__status">Loading 3D model</div>
          </div>
        </template>
      </ClientOnly>
      <div class="hero__visual-card">
        <div>
          <p class="eyebrow">Realtime model</p>
          <h2>{{ homeFeaturedProject.title }}</h2>
        </div>
        <NuxtLink class="button" :to="`/portfolio/${homeFeaturedProject.id}`">Open Project</NuxtLink>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="section-heading">
      <p class="eyebrow">Process</p>
      <div>
        <h2>A character pipeline built for clarity.</h2>
        <p>
          From sculpt to final render, every step supports the same goal: a character that reads instantly and holds up under closer inspection.
        </p>
      </div>
    </div>

    <div class="process-grid">
      <div v-for="(item, index) in process" :key="item.title" class="process-card">
        <span>{{ String(index + 1).padStart(2, '0') }}</span>
        <h3>{{ item.title }}</h3>
        <p>{{ item.text }}</p>
      </div>
    </div>
  </section>

</template>
