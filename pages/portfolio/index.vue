<script setup lang="ts">
import { projects, robloxProjects } from '~/data/portfolio'

useSeoMeta({
  title: 'Portfolio',
  description: 'A selected portfolio of 3D character projects by Ali Taha Yapışkan.',
  ogTitle: 'Portfolio - ATY',
  ogDescription: 'A selected portfolio of 3D character projects by Ali Taha Yapışkan.',
  ogImage: projects[0].cover
})

const revealRootRef = ref<HTMLElement | null>(null)
const activePortfolioTab = ref('current')
const activeRobloxIndex = ref<number | null>(null)
let revealObserver: IntersectionObserver | null = null
const activeRobloxProject = computed(() => (
  activeRobloxIndex.value === null ? null : robloxProjects[activeRobloxIndex.value] ?? null
))
const activeRobloxCount = computed(() => (
  activeRobloxIndex.value === null ? '' : String(activeRobloxIndex.value + 1).padStart(2, '0')
))

const portfolioTabs = [
  { id: 'current', label: 'Main Portfolio', count: projects.length },
  { id: 'roblox', label: 'Roblox Portfolio', count: robloxProjects.length }
]

const getRevealDelay = (index: number) => `${Math.min(index, 5) * 28}ms`

const observePortfolioReveals = () => {
  if (!revealRootRef.value) return

  const revealElements = revealRootRef.value.querySelectorAll<HTMLElement>('.fabrica-reveal:not(.is-visible)')

  if (!('IntersectionObserver' in window) || !revealObserver) {
    revealElements.forEach((element) => element.classList.add('is-visible'))
    return
  }

  revealElements.forEach((element) => revealObserver?.observe(element))
}

const selectPortfolioTab = async (tabId: string) => {
  if (activePortfolioTab.value === tabId) return

  activePortfolioTab.value = tabId
  await nextTick()
  observePortfolioReveals()
}

const openRobloxProject = (index: number) => {
  activeRobloxIndex.value = index
}

const closeRobloxProject = () => {
  activeRobloxIndex.value = null
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

  if (event.key === 'Escape') {
    event.preventDefault()
    closeRobloxProject()
  }

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
  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            revealObserver?.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '280px 0px 360px 0px', threshold: 0.01 }
    )
  }

  observePortfolioReveals()

  window.addEventListener('keydown', handleRobloxLightboxKeydown)
})

onBeforeUnmount(() => {
  revealObserver?.disconnect()
  window.removeEventListener('keydown', handleRobloxLightboxKeydown)
})
</script>

<template>
  <div class="fabrica-page">
    <div ref="revealRootRef" class="fabrica-page__inner">
      <div class="fabrica-page__top">
        <div class="fabrica-panel__header fabrica-reveal fabrica-reveal--tabs">
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
                @click="selectPortfolioTab(tab.id)"
              >
                <span class="fabrica-tabs__label">{{ tab.label }}</span>
                <span class="fabrica-tabs__count">{{ tab.count }}</span>
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
                  :style="{ '--reveal-delay': getRevealDelay(index) }"
                >
                  <NuxtLink
                    :to="`/portfolio/${project.id}`"
                    class="fabrica-card"
                  >
                    <div class="fabrica-card__media">
                      <img
                        :src="project.cover"
                        :alt="project.title"
                        :loading="index < 4 ? 'eager' : 'lazy'"
                        :fetchpriority="index < 2 ? 'high' : 'auto'"
                      >
                      <div class="fabrica-card__media-overlay"></div>
                    </div>
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
                  v-for="(project, index) in robloxProjects"
                  :key="project.id"
                  class="fabrica-reveal fabrica-reveal--card"
                  :style="{ '--reveal-delay': getRevealDelay(index) }"
                >
                  <button
                    class="fabrica-card fabrica-card--button"
                    type="button"
                    :aria-label="`Open ${project.title} Roblox project preview`"
                    @click="openRobloxProject(index)"
                  >
                    <div class="fabrica-card__media">
                      <img
                        :src="project.cover"
                        :alt="project.title"
                        :loading="index < 9 ? 'eager' : 'lazy'"
                        :fetchpriority="index < 3 ? 'high' : 'auto'"
                      >
                      <div class="fabrica-card__media-overlay"></div>
                    </div>
                  </button>
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
        class="project-lightbox"
        data-lenis-prevent
        role="dialog"
        aria-modal="true"
        :aria-label="`${activeRobloxProject.title} Roblox project preview`"
        @click.self="closeRobloxProject"
      >
        <div class="project-lightbox__bar">
          <span class="project-lightbox__count">{{ activeRobloxCount }} / {{ String(robloxProjects.length).padStart(2, '0') }}</span>
          <button class="project-lightbox__close" type="button" aria-label="Close" @click="closeRobloxProject">×</button>
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
            autoplay
            muted
            loop
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
