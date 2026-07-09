<script setup lang="ts">
import { artist } from '~/data/portfolio'

const mailHref = `mailto:${artist.email}`
const contactLinks = [
  { label: 'Email', value: artist.email, href: mailHref },
  { label: 'ArtStation', value: 'artstation.com/artofaty', href: artist.artstation, external: true },
  { label: 'Linktree', value: 'linktr.ee/artofaty', href: artist.linktree, external: true }
]

useSeoMeta({
  title: 'Contact',
  description: `Contact ${artist.name} for character art, portfolio, freelance, or production inquiries.`
})
</script>

<template>
  <section class="contact-minimal">
    <div class="contact-minimal__inner">
      <div class="contact-minimal__copy">
        <p class="eyebrow">Contact</p>
        <h1>Let's keep it simple.</h1>
        <p>
          For character art, production, freelance, or portfolio inquiries, send a short email. The latest work is available through ArtStation and Linktree.
        </p>
      </div>

      <div class="contact-minimal__links" aria-label="Contact links">
        <a
          v-for="link in contactLinks"
          :key="link.label"
          class="contact-minimal__link"
          :href="link.href"
          :target="link.external ? '_blank' : undefined"
          :rel="link.external ? 'noreferrer' : undefined"
        >
          <span>{{ link.label }}</span>
          <strong>{{ link.value }}</strong>
        </a>
      </div>
    </div>
  </section>
</template>
