<script setup lang="ts">
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const isMobileMenuOpen = ref(false)
const logoSrc = `${runtimeConfig.app.baseURL}logo.png`

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' }
]
const leftNavItems = navItems.slice(0, 2)
const rightNavItems = navItems.slice(2)

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
    <nav class="site-nav site-nav--left" aria-label="Primary navigation left">
      <NuxtLink
        v-for="item in leftNavItems"
        :key="item.to"
        :to="item.to"
        :class="['site-nav__link', { 'site-nav__link--active': isActive(item.to) }]"
      >
        {{ item.label }}
      </NuxtLink>
    </nav>

    <NuxtLink class="brand-mark" to="/" aria-label="ATY home">
      <img :src="logoSrc" alt="ATY" class="brand-logo">
    </NuxtLink>

    <button
      class="site-menu-toggle"
      type="button"
      aria-controls="site-mobile-nav"
      :aria-expanded="isMobileMenuOpen"
      :aria-label="isMobileMenuOpen ? 'Close menu' : 'Open menu'"
      @click="isMobileMenuOpen = !isMobileMenuOpen"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>

    <nav class="site-nav site-nav--right" aria-label="Primary navigation right">
      <NuxtLink
        v-for="item in rightNavItems"
        :key="item.to"
        :to="item.to"
        :class="['site-nav__link', { 'site-nav__link--active': isActive(item.to) }]"
      >
        {{ item.label }}
      </NuxtLink>
    </nav>

    <nav id="site-mobile-nav" class="site-mobile-nav" aria-label="Primary navigation">
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
