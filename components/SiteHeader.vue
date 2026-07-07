<script setup lang="ts">
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const isMobileMenuOpen = ref(false)
const logoSrc = `${runtimeConfig.app.baseURL}logo.png`

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'About', to: '/about' }
]

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }

  return route.path.startsWith(path)
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

watch(() => route.fullPath, closeMobileMenu)
</script>

<template>
  <header class="site-header" :class="{ 'site-header--menu-open': isMobileMenuOpen }">
    <NuxtLink class="brand-mark" to="/" aria-label="ATY home">
      <img :src="logoSrc" alt="ATY" class="brand-logo">
      <span class="brand-name">ALI TAHA Y.</span>
    </NuxtLink>

    <button
      class="site-menu-toggle"
      type="button"
      aria-controls="site-nav"
      :aria-expanded="isMobileMenuOpen"
      :aria-label="isMobileMenuOpen ? 'Close menu' : 'Open menu'"
      @click="isMobileMenuOpen = !isMobileMenuOpen"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>

    <nav id="site-nav" class="site-nav" aria-label="Primary navigation">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :class="['site-nav__link', { 'site-nav__link--active': isActive(item.to) }]"
        @click="closeMobileMenu"
      >
        {{ item.label }}
      </NuxtLink>
    </nav>
  </header>
</template>
