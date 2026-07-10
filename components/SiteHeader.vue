<script setup lang="ts">
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const logoSrc = `${runtimeConfig.app.baseURL}logo.png`

const navItems = [
  { label: 'Works', to: '/' },
  { label: 'About', to: '/about' }
]

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/' || route.path.startsWith('/works')
  }

  return route.path.startsWith(path)
}
</script>

<template>
  <header class="site-header">
    <nav class="site-nav site-nav--left" aria-label="Primary navigation">
      <NuxtLink
        :to="navItems[0].to"
        :class="['site-nav__link', { 'site-nav__link--active': isActive(navItems[0].to) }]"
      >
        {{ navItems[0].label }}
      </NuxtLink>
    </nav>

    <NuxtLink class="brand-mark" to="/" aria-label="ATY home">
      <img :src="logoSrc" alt="ATY" class="brand-logo">
    </NuxtLink>

    <nav class="site-nav site-nav--right" aria-label="Primary navigation">
      <NuxtLink
        :to="navItems[1].to"
        :class="['site-nav__link', { 'site-nav__link--active': isActive(navItems[1].to) }]"
      >
        {{ navItems[1].label }}
      </NuxtLink>
    </nav>
  </header>
</template>
