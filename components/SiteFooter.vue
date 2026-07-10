<script setup lang="ts">
import { artist } from '~/data/portfolio'

</script>

<template>
  <footer class="site-footer" aria-label="Site footer">
    <div class="site-footer__bar">
      <span>&copy; {{ artist.name }}</span>
    </div>
  </footer>
</template>
