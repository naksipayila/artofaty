<script setup lang="ts">
import { artist } from '~/data/portfolio'
</script>

<template>
  <footer class="site-footer">
    <div>
      <p class="eyebrow">Available for selected opportunities</p>
      <h2>Let's build memorable characters.</h2>
    </div>

    <div class="site-footer__links">
      <a :href="`mailto:${artist.email}`">{{ artist.email }}</a>
      <a :href="artist.artstation" target="_blank" rel="noreferrer">ArtStation</a>
      <a :href="artist.linktree" target="_blank" rel="noreferrer">Linktree</a>
    </div>

    <p class="site-footer__meta">© 2026 {{ artist.brand }}. 3D Character Artist based in {{ artist.location }}.</p>
  </footer>
</template>
