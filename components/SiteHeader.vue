<script setup lang="ts">
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const isMobileMenuOpen = ref(false)
const isScrolled = ref(false)
const logoSrc = `${runtimeConfig.app.baseURL}logo.png`
const toggleRef = ref<HTMLButtonElement | null>(null)
const mobileNavRef = ref<HTMLElement | null>(null)

const navItems = [
  { label: 'Works', to: '/works' },
  { label: 'About', to: '/about' }
]
const leftNavItems = navItems.slice(0, 1)
const rightNavItems = navItems.slice(1)

const isActive = (path: string) => {
  if (path === '/works') {
    return route.path.startsWith('/works')
  }

  return route.path.startsWith(path)
}

const openMobileMenu = async () => {
  isMobileMenuOpen.value = true
  document.body.style.overflow = 'hidden'
  await nextTick()
  const firstLink = mobileNavRef.value?.querySelector<HTMLAnchorElement>('a')
  firstLink?.focus()
}

const closeMobileMenu = async () => {
  isMobileMenuOpen.value = false
  document.body.style.overflow = ''
  await nextTick()
  toggleRef.value?.focus()
}

const toggleMobileMenu = () => {
  if (isMobileMenuOpen.value) {
    closeMobileMenu()
  } else {
    openMobileMenu()
  }
}

const handleMobileNavKeydown = (event: KeyboardEvent) => {
  if (!isMobileMenuOpen.value) return

  if (event.key === 'Escape') {
    event.preventDefault()
    closeMobileMenu()
    return
  }

  if (event.key === 'Tab' && mobileNavRef.value) {
    const focusable = [...mobileNavRef.value.querySelectorAll<HTMLElement>(
      'a, button:not([disabled])'
    )]
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }
}

const handleMobileNavClickOutside = (event: MouseEvent) => {
  if (event.target === mobileNavRef.value) {
    closeMobileMenu()
  }
}

const updateScrolled = () => {
  isScrolled.value = window.scrollY > 8
}

onMounted(() => {
  updateScrolled()
  window.addEventListener('scroll', updateScrolled, { passive: true })
  window.addEventListener('keydown', handleMobileNavKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateScrolled)
  window.removeEventListener('keydown', handleMobileNavKeydown)
  document.body.style.overflow = ''
})

watch(() => route.fullPath, closeMobileMenu)
</script>

<template>
  <header
    class="site-header"
    :class="{
      'site-header--menu-open': isMobileMenuOpen,
      'site-header--scrolled': isScrolled
    }"
  >
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
      ref="toggleRef"
      class="site-menu-toggle"
      type="button"
      aria-controls="site-mobile-nav"
      :aria-expanded="isMobileMenuOpen"
      :aria-label="isMobileMenuOpen ? 'Close menu' : 'Open menu'"
      @click="toggleMobileMenu"
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

    <nav ref="mobileNavRef" id="site-mobile-nav" class="site-mobile-nav" aria-label="Primary navigation" @click="handleMobileNavClickOutside">
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
