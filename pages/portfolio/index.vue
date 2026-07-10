<script setup lang="ts">
import { projects, robloxProjects } from '~/data/portfolio'

useSeoMeta({
  title: 'Portfolio',
  description: 'A selected portfolio of 3D character projects by Ali Taha Yapışkan.',
  ogTitle: 'Portfolio - ATY',
  ogDescription: 'A selected portfolio of 3D character projects by Ali Taha Yapışkan.',
  ogImage: projects[0].cover
})

const activePortfolioTab = ref<'current' | 'roblox'>('current')
const activeRobloxIndex = ref<number | null>(null)
const visibleRobloxCount = ref(24)
const robloxLightboxRef = ref<HTMLElement | null>(null)
const robloxCloseButtonRef = ref<HTMLButtonElement | null>(null)
let robloxTrigger: HTMLElement | null = null
const prefersReducedMotion = ref(false)
let reducedMotionQuery: MediaQueryList | null = null
let handleReducedMotionChange: ((event: MediaQueryListEvent) => void) | null = null
const activeRobloxProject = computed(() => (
  activeRobloxIndex.value === null ? null : robloxProjects[activeRobloxIndex.value] ?? null
))
const activeRobloxCount = computed(() => (
  activeRobloxIndex.value === null ? '' : String(activeRobloxIndex.value + 1).padStart(2, '0')
))

const portfolioTabs = [
  { id: 'current', label: 'Main Portfolio', count: projects.length },
  { id: 'roblox', label: 'Roblox Portfolio', count: robloxProjects.length }
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

const trapRobloxLightboxFocus = (event: KeyboardEvent) => {
  if (event.key !== 'Tab' || !robloxLightboxRef.value) return

  const focusableElements = getFocusableElements(robloxLightboxRef.value)
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

const openRobloxProject = async (index: number, event: MouseEvent) => {
  robloxTrigger = event.currentTarget instanceof HTMLElement ? event.currentTarget : null
  activeRobloxIndex.value = index
  setPageInert(true)
  await nextTick()
  robloxCloseButtonRef.value?.focus()
}

const closeRobloxProject = async () => {
  activeRobloxIndex.value = null
  setPageInert(false)
  await nextTick()
  robloxTrigger?.focus()
  robloxTrigger = null
}

const showPreviousRobloxProject = () => {
  if (activeRobloxIndex.value === null) return
  activeRobloxIndex.value = (activeRobloxIndex.value - 1 + robloxProjects.length) % robloxProjects.length
}

const showNextRobloxProject = () => {
  if (activeRobloxIndex.value === null) return
  activeRobloxIndex.value = (activeRobloxIndex.value + 1) % robloxProjects.length
}

const handleRobloxLightboxKeydown = (event: KeyboardEvent) => {
  if (activeRobloxIndex.value === null) return

  trapRobloxLightboxFocus(event)

  if (event.key === 'Escape') {
    event.preventDefault()
    void closeRobloxProject()
  }

  if (event.target instanceof HTMLVideoElement || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    showPreviousRobloxProject()
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault()
    showNextRobloxProject()
  }
}

onMounted(() => {
  reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion.value = reducedMotionQuery.matches
  handleReducedMotionChange = (event) => {
    prefersReducedMotion.value = event.matches
  }
  reducedMotionQuery.addEventListener('change', handleReducedMotionChange)
  window.addEventListener('keydown', handleRobloxLightboxKeydown)
})

onBeforeUnmount(() => {
  setPageInert(false)
  if (reducedMotionQuery && handleReducedMotionChange) {
    reducedMotionQuery.removeEventListener('change', handleReducedMotionChange)
  }
  window.removeEventListener('keydown', handleRobloxLightboxKeydown)
})
</script>

<template>
  <div class="fabrica-page" :class="{ 'fabrica-page--main': activePortfolioTab === 'current' }">
    <div class="fabrica-page__inner">
      <div class="fabrica-page__top">
        <div class="fabrica-page__intro">
          <p class="eyebrow">Selected work</p>
          <h1 class="fabrica-page__title">Portfolio</h1>
          <p class="fabrica-page__description">Character art, hand-painted materials, and realtime presentation studies.</p>
        </div>

        <div class="fabrica-panel__header">
          <div class="fabrica-tabs" role="tablist" aria-label="Portfolio categories">
            <template v-for="(tab, index) in portfolioTabs" :key="tab.id">
              <button
                :id="`portfolio-tab-${tab.id}`"
                class="fabrica-tabs__button"
                :class="{ 'fabrica-tabs__button--active': activePortfolioTab === tab.id }"
                type="button"
                role="tab"
                :aria-selected="activePortfolioTab === tab.id"
                :aria-controls="`portfolio-panel-${tab.id}`"
                :tabindex="activePortfolioTab === tab.id ? 0 : -1"
                @click="selectPortfolioTab(tab.id)"
                @keydown="handlePortfolioTabKeydown($event, tab.id)"
              >
                <span class="fabrica-tabs__label">{{ tab.label }}</span>
                <span class="sr-only">, {{ tab.count }} projects</span>
                <span class="right-curve"></span>
              </button>
              <span v-if="index < portfolioTabs.length - 1" class="fabrica-tabs__separator" aria-hidden="true">|</span>
            </template>
          </div>
        </div>
      </div>

      <section class="fabrica-cards">
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
                  <NuxtLink
                    :to="`/portfolio/${project.id}`"
                    class="fabrica-card"
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
                  </NuxtLink>
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
                    @click="openRobloxProject(index, $event)"
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
    <Transition name="project-lightbox">
      <div
        v-if="activeRobloxProject"
        ref="robloxLightboxRef"
        class="project-lightbox project-lightbox--roblox"
        data-lenis-prevent
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        :aria-label="`${activeRobloxProject.title} Roblox project preview`"
        @click.self="closeRobloxProject"
      >
        <div class="project-lightbox__bar">
          <span class="project-lightbox__count" role="status" :aria-label="`Project ${activeRobloxIndex === null ? '' : activeRobloxIndex + 1} of ${robloxProjects.length}`">{{ activeRobloxCount }} / {{ String(robloxProjects.length).padStart(2, '0') }}</span>
          <button ref="robloxCloseButtonRef" class="project-lightbox__close" type="button" aria-label="Close" @click="closeRobloxProject">×</button>
        </div>

        <button
          class="project-lightbox__nav project-lightbox__nav--prev"
          type="button"
          aria-label="Previous Roblox project"
          @click="showPreviousRobloxProject"
        >
          <span aria-hidden="true">←</span>
        </button>

        <figure class="project-lightbox__figure">
          <video
            v-if="activeRobloxProject.video"
            :key="activeRobloxProject.video"
            class="project-lightbox__video"
            :poster="activeRobloxProject.cover"
            controls
            :autoplay="!prefersReducedMotion"
            muted
            :loop="!prefersReducedMotion"
            playsinline
          >
            <source :src="activeRobloxProject.video" type="video/mp4">
          </video>
          <img v-else :src="activeRobloxProject.image" :alt="`${activeRobloxProject.title} Roblox project image`">
          <figcaption class="project-lightbox__caption">{{ activeRobloxProject.title }}</figcaption>
        </figure>

        <button
          class="project-lightbox__nav project-lightbox__nav--next"
          type="button"
          aria-label="Next Roblox project"
          @click="showNextRobloxProject"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>
