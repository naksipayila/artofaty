<script setup lang="ts">
import { projects } from '~/data/portfolio'

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
        <p>
          I create stylized and fantasy-focused 3D characters, combining sculpting, hand-painted texture work, and realtime presentation for game art portfolios and production-ready visuals.
        </p>
      </div>

      <div class="hero__actions">
        <NuxtLink class="button button--primary" to="/portfolio">View portfolio</NuxtLink>
      </div>

      <p class="hero__status-line">Currently exploring — stylized faces, readable silhouettes, hand-painted materials</p>
    </div>

    <div class="hero__visual hero__visual--model" :aria-label="`${homeFeaturedProject.title} realtime 3D character model`">
      <div class="passport-frame" aria-hidden="true">
        <div class="passport-topline">
          <span>CHARACTER DOSSIER</span>
          <span>NO. 01</span>
        </div>
        <ul class="passport-specs passport-specs--left">
          <li>SCULPT</li>
          <li>HAND-PAINTED</li>
          <li>GAME-READY</li>
        </ul>
        <ul class="passport-specs passport-specs--right">
          <li>~18K TRIS</li>
          <li>2K PBR TEX</li>
          <li>REALTIME</li>
        </ul>
        <div class="passport-name">MISS FORTUNE</div>
        <div class="passport-year">ART OF ATY</div>
        <div class="passport-rule passport-rule--top"></div>
        <div class="passport-rule passport-rule--left"></div>
        <div class="passport-rule passport-rule--right"></div>
        <div class="passport-rule passport-rule--bottom"></div>
        <div class="passport-tick passport-tick--tl"></div>
        <div class="passport-tick passport-tick--tr"></div>
        <div class="passport-tick passport-tick--bl"></div>
        <div class="passport-tick passport-tick--br"></div>
      </div>
      <HomeModelViewer
        model-path="models/MissFortune_low.fbx"
        :poster-path="homeHeroImage"
        :label="`${homeFeaturedProject.title} realtime 3D character model`"
      />
    </div>
  </section>
</template>
