<script setup lang="ts">
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const logoSrc = `${runtimeConfig.app.baseURL}logo.png`
const worksMenuOpen = ref(false)
const worksMenuRef = ref<HTMLElement | null>(null)
const worksMenuTriggerRef = ref<HTMLButtonElement | null>(null)

const worksMenuItems = [
  { label: 'Main', to: '/' },
  { label: 'Roblox', to: '/roblox' }
]

const isHeaderVisible = ref(true)
let lastScrollY = 0

const isWorksActive = () =>
  route.path === '/' || route.path.startsWith('/works') || route.path === '/roblox'

const isActive = (path: string) => route.path.startsWith(path)

const closeWorksMenu = (restoreFocus = false) => {
  worksMenuOpen.value = false

  if (restoreFocus) {
    nextTick(() => worksMenuTriggerRef.value?.focus())
  }
}

const focusWorksMenuItem = (index: number) => {
  nextTick(() => {
    const items = [...(worksMenuRef.value?.querySelectorAll<HTMLAnchorElement>('[role="menuitem"]') || [])]
    items[index]?.focus()
  })
}

const toggleWorksMenu = () => {
  worksMenuOpen.value = !worksMenuOpen.value
}

const handleWorksMenuKeydown = (event: KeyboardEvent) => {
  const items = [...(worksMenuRef.value?.querySelectorAll<HTMLAnchorElement>('[role="menuitem"]') || [])]
  const currentIndex = items.indexOf(document.activeElement as HTMLAnchorElement)

  if (event.key === 'Escape' && worksMenuOpen.value) {
    event.preventDefault()
    closeWorksMenu(true)
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    worksMenuOpen.value = true
    focusWorksMenuItem(currentIndex >= 0 ? (currentIndex + 1) % items.length : 0)
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    worksMenuOpen.value = true
    focusWorksMenuItem(currentIndex >= 0 ? (currentIndex - 1 + items.length) % items.length : worksMenuItems.length - 1)
    return
  }

  if (event.key === 'Home' && currentIndex >= 0) {
    event.preventDefault()
    focusWorksMenuItem(0)
  }

  if (event.key === 'End' && currentIndex >= 0) {
    event.preventDefault()
    focusWorksMenuItem(items.length - 1)
  }
}

const handlePointerDown = (event: PointerEvent) => {
  if (worksMenuRef.value?.contains(event.target as Node)) return
  closeWorksMenu()
}

const handleScroll = () => {
  if (window.innerWidth <= 760) {
    isHeaderVisible.value = true
    return
  }

  const currentScrollY = window.scrollY

  if (currentScrollY <= 0) {
    isHeaderVisible.value = true
    lastScrollY = 0
    return
  }

  if (Math.abs(currentScrollY - lastScrollY) < 8) return

  isHeaderVisible.value = currentScrollY < lastScrollY
  lastScrollY = currentScrollY
}

watch(() => route.path, () => closeWorksMenu())

onMounted(() => {
  lastScrollY = window.scrollY
  window.addEventListener('scroll', handleScroll, { passive: true })
  document.addEventListener('pointerdown', handlePointerDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('pointerdown', handlePointerDown)
})
</script>

<template>
  <header :class="['site-header', { 'site-header--hidden': !isHeaderVisible }]">
    <nav class="site-nav site-nav--left" aria-label="Primary navigation">
      <div
        ref="worksMenuRef"
        :class="['site-menu', { 'site-menu--open': worksMenuOpen }]"
        @keydown="handleWorksMenuKeydown"
      >
        <button
          ref="worksMenuTriggerRef"
          :class="['site-nav__link', 'site-nav__button', { 'site-nav__link--active': isWorksActive() }]"
          type="button"
          data-label="Works"
          aria-controls="works-submenu"
          :aria-expanded="worksMenuOpen"
          @click="toggleWorksMenu"
        >
          <span class="site-nav__label">Works</span>
          <svg class="site-nav__chevron" viewBox="0 0 12 12" aria-hidden="true">
            <path d="m3 4.5 3 3 3-3" />
          </svg>
        </button>

        <div v-if="worksMenuOpen" id="works-submenu" class="site-subnav" role="menu" aria-label="Works pages">
          <NuxtLink
            v-for="item in worksMenuItems"
            :key="item.to"
            class="site-subnav__link"
            :to="item.to"
            role="menuitem"
            :aria-current="route.path === item.to ? 'page' : undefined"
            @click="closeWorksMenu"
          >
            {{ item.label }}
          </NuxtLink>
        </div>
      </div>
    </nav>

    <NuxtLink class="brand-mark" to="/" aria-label="ATY home">
      <img :src="logoSrc" alt="ATY" class="brand-logo">
    </NuxtLink>

    <nav class="site-nav site-nav--right" aria-label="Primary navigation">
      <NuxtLink
        to="/about"
        :class="['site-nav__link', { 'site-nav__link--active': isActive('/about') }]"
        data-label="About"
      >
        <span class="site-nav__label">About</span>
      </NuxtLink>
    </nav>
  </header>
</template>
