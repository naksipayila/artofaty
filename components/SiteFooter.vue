<script setup lang="ts">
import { artist } from '~/data/portfolio'

const socialLinks = [
  {
    label: 'ArtStation',
    href: artist.artstation,
    iconPath: 'M4 18.5h11.5l-1.8-3.1H5.8L4 18.5Zm2.9-5.1h5.6L9.7 8.5l-2.8 4.9Zm13.1 5.1h-2.2L11.1 6.7l1.9-3.2 7 12.1v2.9Z'
  },
  {
    label: 'Linktree',
    href: artist.linktree,
    iconPath: 'M12 3.5 7.3 8.2l2.7 2.7H5.7v3.5H10l-2.7 2.7L12 21.8l4.7-4.7-2.7-2.7h4.3v-3.5H14l2.7-2.7L12 3.5Z'
  },
  {
    label: 'Email',
    href: `mailto:${artist.email}`,
    iconPath: 'M3.8 6.5h16.4v11H3.8v-11Zm1.9 1.8 6.3 4.4 6.3-4.4H5.7Zm12.7 7.4v-5.1L12 15.1l-6.4-4.5v5.1h12.8Z'
  }
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
          <span class="site-footer__social-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path :d="link.iconPath" />
            </svg>
          </span>
          <span class="sr-only">{{ link.label }}</span>
        </a>
      </div>
    </div>
  </footer>
</template>
