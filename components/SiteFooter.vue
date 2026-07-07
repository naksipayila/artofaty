<script setup lang="ts">
import { artist } from '~/data/portfolio'

const socialLinks = [
  { label: 'ArtStation', short: 'AS', href: artist.artstation },
  { label: 'Linktree', short: 'LT', href: artist.linktree },
  { label: 'Email', short: '@', href: `mailto:${artist.email}` }
]
</script>

<template>
  <footer class="site-footer" aria-label="Site footer">
    <div class="site-footer__bar">
      <a class="site-footer__credit" :href="artist.artstation" target="_blank" rel="noreferrer">
        <span>Portfolio by</span>
        <strong>{{ artist.name }}</strong>
      </a>

      <a class="site-footer__top" href="#top" aria-label="Back to top">
        <span>Back to Top</span>
        <span aria-hidden="true">&uarr;</span>
      </a>

      <div class="site-footer__socials" aria-label="Social links">
        <a
          v-for="link in socialLinks"
          :key="link.href"
          class="site-footer__social"
          :href="link.href"
          :aria-label="link.label"
          :target="link.href.startsWith('mailto:') ? undefined : '_blank'"
          :rel="link.href.startsWith('mailto:') ? undefined : 'noreferrer'"
        >
          <span>{{ link.short }}</span>
        </a>
      </div>
    </div>
  </footer>
</template>
