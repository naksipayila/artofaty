<script setup lang="ts">
import { artist } from '~/data/portfolio'

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer" aria-label="Site footer">
    <div class="site-footer__bar">
      <p class="site-footer__credit">
        <span>&copy; {{ currentYear }} {{ artist.name }}</span>
        <span class="site-footer__role">3D Character Artist</span>
      </p>

      <a class="site-footer__top" href="#top">
        Back to top
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M10 15V5M6 9l4-4 4 4" />
        </svg>
      </a>
    </div>
  </footer>
</template>
