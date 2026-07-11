<script setup lang="ts">
import { artist } from '~/data/portfolio'

const currentYear = new Date().getFullYear()

const socialLinks = [
  { name: 'Instagram', href: artist.instagram, icon: 'instagram' },
  { name: 'LinkedIn', href: artist.linkedin, icon: 'linkedin' },
  { name: 'ArtStation', href: artist.artstation, icon: 'artstation' },
  { name: 'YouTube', href: artist.youtube, icon: 'youtube' }
]
</script>

<template>
  <footer class="site-footer" aria-label="Site footer">
    <div class="site-footer__bar">
      <p class="site-footer__credit">
        <span>&copy; {{ currentYear }} {{ artist.name }}</span>
      </p>

      <nav class="site-footer__socials" aria-label="Social media">
        <a
          v-for="social in socialLinks"
          :key="social.name"
          :href="social.href"
          :aria-label="social.name"
          target="_blank"
          rel="noreferrer"
        >
          <svg v-if="social.icon === 'instagram'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.3" cy="6.7" r="0.9" fill="currentColor" stroke="none" />
          </svg>
          <svg v-else-if="social.icon === 'linkedin'" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M6.1 8.3H3.2V20h2.9V8.3ZM4.65 3.6A1.7 1.7 0 1 0 4.7 7a1.7 1.7 0 0 0-.05-3.4ZM20.8 13.3c0-3.53-1.88-5.17-4.4-5.17-2.03 0-2.94 1.12-3.45 1.9V8.3H10V20h2.95v-5.8c0-1.53.3-3.02 2.18-3.02 1.85 0 1.87 1.73 1.87 3.12V20H20.8v-6.7Z" />
          </svg>
          <svg v-else-if="social.icon === 'artstation'" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M0 17.723l2.027 3.505h.001a2.424 2.424 0 0 0 2.164 1.333h13.457l-2.792-4.838H0zm24 .025c0-.484-.143-.935-.388-1.314L15.728 2.728a2.424 2.424 0 0 0-2.142-1.289H9.419L21.598 22.54l1.92-3.325c.378-.637.482-.919.482-1.467zm-11.129-3.462L7.428 4.858l-5.444 9.428h10.887z" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M21.58 7.19a2.96 2.96 0 0 0-2.08-2.1C17.67 4.6 12 4.6 12 4.6s-5.67 0-7.5.49a2.96 2.96 0 0 0-2.08 2.1A31.2 31.2 0 0 0 2 12a31.2 31.2 0 0 0 .42 4.81 2.96 2.96 0 0 0 2.08 2.1c1.83.49 7.5.49 7.5.49s5.67 0 7.5-.49a2.96 2.96 0 0 0 2.08-2.1A31.2 31.2 0 0 0 22 12a31.2 31.2 0 0 0-.42-4.81ZM10.2 15.1V8.9l5.2 3.1-5.2 3.1Z" />
          </svg>
        </a>
      </nav>

      <a class="site-footer__top" href="#top">
        Back to top
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M10 15V5M6 9l4-4 4 4" />
        </svg>
      </a>
    </div>
  </footer>
</template>
