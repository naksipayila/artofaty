<script setup lang="ts">
import { projects, robloxProjects } from '~/data/portfolio'

const { start: startCursor, stop: stopCursor } = useCustomCursor()

useSeoMeta({
  title: 'Works',
  description: 'Selected character art, hand-painted materials, and realtime presentation studies by Ali Taha Yapışkan.',
  ogTitle: 'Works - ATY',
  ogDescription: 'Selected character art, hand-painted materials, and realtime presentation studies by Ali Taha Yapışkan.',
  ogImage: projects[0].cover
})

const activePortfolioTab = ref<'current' | 'roblox'>('current')
const activeLightboxIndex = ref<number | null>(null)
const lightboxRef = ref<HTMLElement | null>(null)
const lightboxCloseButtonRef = ref<HTMLButtonElement | null>(null)
const visibleRobloxCount = ref(24)
let lightboxTrigger: HTMLElement | null = null
const prefersReducedMotion = ref(false)
let reducedMotionQuery: MediaQueryList | null = null
let handleReducedMotionChange: ((event: MediaQueryListEvent) => void) | null = null

const currentTabItems = computed(() => activePortfolioTab.value === 'current' ? projects : visibleRobloxProjects.value)

const activeLightboxProject = computed(() => {
  if (activeLightboxIndex.value === null) return null
  const items = currentTabItems.value
  return items[activeLightboxIndex.value] ?? null
})

const activeLightboxCount = computed(() =>
  activeLightboxIndex.value === null ? '' : String(activeLightboxIndex.value + 1).padStart(2, '0')
)

const activeLightboxTotal = computed(() =>
  String(currentTabItems.value.length).padStart(2, '0')
)

const portfolioTabs = [
  { id: 'current', label: 'Main Characters', count: projects.length },
  { id: 'roblox', label: 'Roblox Worlds', count: robloxProjects.length }
] as const

const visibleRobloxProjects = computed(() => robloxProjects.slice(0, visibleRobloxCount.value))
const remainingRobloxProjects = computed(() => Math.max(robloxProjects.length - visibleRobloxCount.value, 0))
const hasMoreRobloxProjects = computed(() => remainingRobloxProjects.value > 0)

const getFocusableElements = (container: HTMLElement) => (
  [...container.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
  )].filter((element) => !element.hasAttribute('disabled'))
)

const setPageInert = (isInert: boolean) => {
  document.querySelector('.site-shell')?.toggleAttribute('inert', isInert)
}

const trapLightboxFocus = (event: KeyboardEvent) => {
  if (event.key !== 'Tab' || !lightboxRef.value) return

  const focusableElements = getFocusableElements(lightboxRef.value)
  if (!focusableElements.length) return

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement.focus()
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement.focus()
  }
}

const selectPortfolioTab = async (tabId: 'current' | 'roblox', shouldFocus = false) => {
  if (activePortfolioTab.value !== tabId) {
    activePortfolioTab.value = tabId
    await nextTick()
  }

  if (shouldFocus) {
    document.getElementById(`portfolio-tab-${tabId}`)?.focus()
  }
}

const handlePortfolioTabKeydown = (event: KeyboardEvent, tabId: 'current' | 'roblox') => {
  const tabIndex = portfolioTabs.findIndex((tab) => tab.id === tabId)
  let nextIndex = tabIndex

  if (event.key === 'ArrowRight') nextIndex = (tabIndex + 1) % portfolioTabs.length
  if (event.key === 'ArrowLeft') nextIndex = (tabIndex - 1 + portfolioTabs.length) % portfolioTabs.length
  if (event.key === 'Home') nextIndex = 0
  if (event.key === 'End') nextIndex = portfolioTabs.length - 1
  if (nextIndex === tabIndex) return

  event.preventDefault()
  void selectPortfolioTab(portfolioTabs[nextIndex].id, true)
}

const showMoreRobloxProjects = () => {
  visibleRobloxCount.value = Math.min(visibleRobloxCount.value + 24, robloxProjects.length)
}

const getLightboxImage = (item: any) => {
  if (activePortfolioTab.value === 'current') {
    return item.images?.[0] ?? item.cover
  }
  return item.image ?? item.cover
}

const getLightboxVideo = (item: any) => {
  if (activePortfolioTab.value === 'roblox') {
    return item.video ?? null
  }
  return null
}

const openLightbox = async (index: number, event: MouseEvent) => {
  lightboxTrigger = event.currentTarget instanceof HTMLElement ? event.currentTarget : null
  activeLightboxIndex.value = index
  setPageInert(true)
  await nextTick()
  lightboxCloseButtonRef.value?.focus()
}

const closeLightbox = async () => {
  activeLightboxIndex.value = null
  setPageInert(false)
  await nextTick()
  lightboxTrigger?.focus()
  lightboxTrigger = null
}

const showPreviousLightboxItem = () => {
  if (activeLightboxIndex.value === null) return
  activeLightboxIndex.value = (activeLightboxIndex.value - 1 + currentTabItems.value.length) % currentTabItems.value.length
}

const showNextLightboxItem = () => {
  if (activeLightboxIndex.value === null) return
  activeLightboxIndex.value = (activeLightboxIndex.value + 1) % currentTabItems.value.length
}

const handleLightboxKeydown = (event: KeyboardEvent) => {
  if (activeLightboxIndex.value === null) return

  trapLightboxFocus(event)

  if (event.key === 'Escape') {
    event.preventDefault()
    void closeLightbox()
  }

  if (event.target instanceof HTMLVideoElement || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    showPreviousLightboxItem()
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault()
    showNextLightboxItem()
  }
}

onMounted(() => {
  reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion.value = reducedMotionQuery.matches
  handleReducedMotionChange = (event) => {
    prefersReducedMotion.value = event.matches
  }
  reducedMotionQuery.addEventListener('change', handleReducedMotionChange)
  window.addEventListener('keydown', handleLightboxKeydown)
  startCursor()
})

onBeforeUnmount(() => {
  setPageInert(false)
  stopCursor()
  if (reducedMotionQuery && handleReducedMotionChange) {
    reducedMotionQuery.removeEventListener('change', handleReducedMotionChange)
  }
  window.removeEventListener('keydown', handleLightboxKeydown)
})
</script>

<template>
  <div class="fabrica-page" :class="{ 'fabrica-page--main': activePortfolioTab === 'current' }">
    <div class="fabrica-page__inner">
      <div class="fabrica-page__top">
        <div class="fabrica-page__intro">
          <p class="eyebrow">Selected work</p>
          <h1 class="fabrica-page__title">Works</h1>
          <p class="fabrica-page__description">Character art, hand-painted materials, and realtime presentation studies.</p>
        </div>
      </div>

      <section class="fabrica-cards">
        <nav class="work-index" aria-label="Portfolio categories" role="tablist">
          <button
            v-for="(tab, index) in portfolioTabs"
            :key="tab.id"
            :id="`portfolio-tab-${tab.id}`"
            class="work-index__tab"
            :class="{ 'work-index__tab--active': activePortfolioTab === tab.id }"
            type="button"
            role="tab"
            :aria-selected="activePortfolioTab === tab.id"
            :aria-controls="`portfolio-panel-${tab.id}`"
            :tabindex="activePortfolioTab === tab.id ? 0 : -1"
            @click="selectPortfolioTab(tab.id)"
            @keydown="handlePortfolioTabKeydown($event, tab.id)"
          >
            {{ tab.label }}
          </button>
        </nav>
        <div class="fabrica-tabbed-panel">
          <div class="fabrica-panel">
            <div class="fabrica-panel__body">
              <div
                v-if="activePortfolioTab === 'current'"
                id="portfolio-panel-current"
                class="fabrica-grid fabrica-grid--main"
                role="tabpanel"
                aria-labelledby="portfolio-tab-current"
              >
                <div
                  v-for="(project, index) in projects"
                  :key="project.id"
                  class="fabrica-reveal fabrica-reveal--card"
                >
                  <button
                    class="fabrica-card fabrica-card--button"
                    type="button"
                    :aria-label="`Open ${project.title}`"
                    @click="openLightbox(index, $event)"
                  >
                    <div class="fabrica-card__media">
                      <img
                        :src="project.cover"
                        alt=""
                        :style="{ objectPosition: project.coverCrop, transformOrigin: project.coverOrigin, '--cover-scale': project.coverScale }"
                        :loading="index < 4 ? 'eager' : 'lazy'"
                        :fetchpriority="index < 2 ? 'high' : 'auto'"
                      >
                    </div>
                    <span class="fabrica-card__name">{{ project.title }}</span>
                  </button>
                </div>
              </div>

              <div
                v-else
                id="portfolio-panel-roblox"
                class="fabrica-grid fabrica-grid--roblox"
                role="tabpanel"
                aria-labelledby="portfolio-tab-roblox"
              >
                <div
                  v-for="(project, index) in visibleRobloxProjects"
                  :key="project.id"
                  class="fabrica-reveal fabrica-reveal--card"
                >
                  <button
                    class="fabrica-card fabrica-card--button"
                    type="button"
                    :aria-label="`Open ${project.title} Roblox project preview`"
                    @click="openLightbox(index, $event)"
                  >
                    <div class="fabrica-card__media">
                      <img
                        :src="project.cover"
                        alt=""
                        :loading="index < 4 ? 'eager' : 'lazy'"
                        :fetchpriority="index < 2 ? 'high' : 'auto'"
                      >
                    </div>
                    <span class="fabrica-card__name">{{ project.title }}</span>
                  </button>
                </div>

                <div v-if="hasMoreRobloxProjects" class="fabrica-load-more">
                  <button class="button fabrica-load-more__button" type="button" @click="showMoreRobloxProjects">
                    Show {{ Math.min(24, remainingRobloxProjects) }} more projects
                  </button>
                  <p aria-live="polite">Showing {{ visibleRobloxProjects.length }} of {{ robloxProjects.length }} projects</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>

  <Teleport to="body">
      <div
        v-if="activeLightboxProject"
        ref="lightboxRef"
        class="project-lightbox"
        data-lenis-prevent
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        :aria-label="`${activeLightboxProject.title}`"
        @click.self="closeLightbox"
      >
        <div class="project-lightbox__bar project-lightbox__bar--detail">
          <span class="project-lightbox__count" role="status" :aria-label="`Project ${activeLightboxIndex === null ? '' : activeLightboxIndex + 1} of ${currentTabItems.length}`">{{ activeLightboxCount }} / {{ activeLightboxTotal }}</span>
          <button ref="lightboxCloseButtonRef" class="project-lightbox__close" type="button" aria-label="Close" @click="closeLightbox">×</button>
        </div>

        <button
          v-if="currentTabItems.length > 1"
          class="project-lightbox__nav project-lightbox__nav--prev"
          type="button"
          aria-label="Previous"
          @click="showPreviousLightboxItem"
        >
          <span aria-hidden="true">←</span>
        </button>

        <figure class="project-lightbox__figure">
          <video
            v-if="getLightboxVideo(activeLightboxProject)"
            :key="getLightboxVideo(activeLightboxProject)"
            class="project-lightbox__video"
            :poster="activeLightboxProject.cover"
            controls
            :autoplay="!prefersReducedMotion"
            muted
            :loop="!prefersReducedMotion"
            playsinline
          >
            <source :src="getLightboxVideo(activeLightboxProject)" type="video/mp4">
          </video>
          <img v-else :src="getLightboxImage(activeLightboxProject)" :alt="activeLightboxProject.title">
        </figure>

        <button
          v-if="currentTabItems.length > 1"
          class="project-lightbox__nav project-lightbox__nav--next"
          type="button"
          aria-label="Next"
          @click="showNextLightboxItem"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
  </Teleport>
</template>
