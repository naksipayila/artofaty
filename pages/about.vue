<script setup lang="ts">
import { artist } from '~/data/portfolio'

const mailHref = `mailto:${artist.email}`
const runtimeConfig = useRuntimeConfig()
const logoSrc = `${runtimeConfig.app.baseURL}logo.png`
const skills = ['Digital sculpting', 'Digital painting', 'Character modeling', 'UV mapping', 'Retopology']
const tools = ['ZBrush', 'Maya', 'Substance 3D Painter', 'Unreal Engine', 'Blender', 'Marmoset Toolbag', 'Photoshop', 'Cinema 4D']

useSeoMeta({
  title: 'About',
  description: `${artist.name} is a 3D Character Artist in ${artist.location}, creating handcrafted characters for games and realtime presentation.`
})
</script>

<template>
  <section class="about-page">
    <div class="about-page__intro">
      <div class="about-page__copy">
        <p class="eyebrow">About</p>
        <h1>Bringing unique characters to life.</h1>
        <p class="about-page__lead">
          Hi, I'm Ali, a 3D character and creature artist based in {{ artist.location }}. I focus on digital craftsmanship, from expressive stylized characters and hand-painted materials to creature studies and realtime presentation.
        </p>

        <div class="button-row">
          <a class="button button--primary" :href="artist.artstation" target="_blank" rel="noreferrer">ArtStation</a>
          <a class="button" :href="mailHref">Email</a>
        </div>
      </div>

      <aside class="about-page__profile" aria-label="Artist profile">
        <img :src="logoSrc" alt="ATY" class="about-page__avatar">
        <div>
          <p class="about-page__name">{{ artist.name }}</p>
          <p class="about-page__role">{{ artist.role }}</p>
        </div>
        <p class="about-page__location">{{ artist.location }}</p>
      </aside>
    </div>

    <div class="about-page__details">
      <section class="about-page__craft">
        <p class="eyebrow">Practice</p>
        <p>
          Every character in this portfolio is handcrafted. No generative AI is used in the character work: each piece is developed through sculpting, modeling, texture work, and presentation.
        </p>
      </section>

      <section class="about-page__specialties" aria-labelledby="specialties-heading">
        <p class="eyebrow" id="specialties-heading">Specialties</p>
        <ul>
          <li v-for="skill in skills" :key="skill">{{ skill }}</li>
        </ul>
      </section>

      <section class="about-page__tools" aria-labelledby="tools-heading">
        <p class="eyebrow" id="tools-heading">Tools</p>
        <ul>
          <li v-for="tool in tools" :key="tool">{{ tool }}</li>
        </ul>
      </section>

      <section class="about-page__availability" aria-labelledby="availability-heading">
        <p class="eyebrow" id="availability-heading">Availability</p>
        <p>Open to full-time, contract, and freelance opportunities.</p>
      </section>
    </div>
  </section>
</template>
