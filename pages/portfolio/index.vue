<script setup lang="ts">
import { projects, robloxProjects } from '~/data/portfolio'

useSeoMeta({
  title: 'Portfolio',
  description: 'A selected portfolio of 3D character projects by Ali Taha Yapışkan.',
  ogTitle: 'Portfolio - ATY',
  ogDescription: 'A selected portfolio of 3D character projects by Ali Taha Yapışkan.',
  ogImage: projects[0].cover
})

const cardsRef = ref<HTMLElement | null>(null)
const cardsVisible = ref(false)
const activePortfolioTab = ref('current')
const activeRobloxIndex = ref<number | null>(null)
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

const activePortfolioSummary = computed(() => (
  activePortfolioTab.value === 'roblox'
    ? `${robloxProjects.length} Roblox Works`
    : `${projects.length} Selected Works`
))

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
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === cardsRef.value) cardsVisible.value = true
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )

    if (cardsRef.value) observer.observe(cardsRef.value)
  } else {
    cardsVisible.value = true
  }

  window.addEventListener('keydown', handleRobloxLightboxKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleRobloxLightboxKeydown)
})
</script>

<template>
  <div class="fabrica-page">
    <div class="fabrica-page__inner">
      <section ref="cardsRef" class="fabrica-cards" :class="{ 'fabrica-cards--visible': cardsVisible }">
        <div class="fabrica-tabbed-panel">
          <div class="fabrica-panel">
            <div class="fabrica-panel__header">
              <div class="fabrica-tabs" role="tablist" aria-label="Portfolio categories">
                <button
                  v-for="tab in portfolioTabs"
                  :id="`portfolio-tab-${tab.id}`"
                  :key="tab.id"
                  class="fabrica-tabs__button"
                  :class="{ 'fabrica-tabs__button--active': activePortfolioTab === tab.id }"
                  type="button"
                  role="tab"
                  :aria-selected="activePortfolioTab === tab.id"
                  :aria-controls="`portfolio-panel-${tab.id}`"
                  @click="activePortfolioTab = tab.id"
                >
                  <span class="fabrica-tabs__label">{{ tab.label }}</span>
                  <span class="fabrica-tabs__count">{{ tab.count }}</span>
                  <span class="right-curve"></span>
                </button>
              </div>

              <p class="fabrica-panel__meta">{{ activePortfolioSummary }}</p>
            </div>

            <div class="fabrica-panel__body">
              <div
                v-if="activePortfolioTab === 'current'"
                id="portfolio-panel-current"
                class="fabrica-grid fabrica-grid--main"
                role="tabpanel"
                aria-labelledby="portfolio-tab-current"
              >
                <NuxtLink
                  v-for="project in projects"
                  :key="project.id"
                  :to="`/portfolio/${project.id}`"
                  class="fabrica-card"
                >
                  <div class="fabrica-card__media">
                    <img :src="project.cover" :alt="project.title" loading="lazy">
                    <div class="fabrica-card__media-overlay"></div>
                    <span class="fabrica-card__title">{{ project.title }}</span>
                  </div>
                </NuxtLink>
              </div>

              <div
                v-else
                id="portfolio-panel-roblox"
                class="fabrica-grid fabrica-grid--roblox"
                role="tabpanel"
                aria-labelledby="portfolio-tab-roblox"
              >
                <button
                  v-for="(project, index) in robloxProjects"
                  :key="project.id"
                  class="fabrica-card fabrica-card--button"
                  type="button"
                  :aria-label="`Open ${project.title} Roblox project preview`"
                  @click="openRobloxProject(index)"
                >
                  <div class="fabrica-card__media">
                    <img :src="project.cover" :alt="project.title" loading="lazy">
                    <div class="fabrica-card__media-overlay"></div>
                    <span class="fabrica-card__title">{{ project.title }}</span>
                  </div>
                </button>
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
        role="dialog"
        aria-modal="true"
        :aria-label="`${activeRobloxProject.title} Roblox project preview`"
        @click.self="closeRobloxProject"
      >
        <div class="project-lightbox__bar">
          <span>{{ activeRobloxCount }} / {{ String(robloxProjects.length).padStart(2, '0') }}</span>
          <button type="button" @click="closeRobloxProject">Close</button>
        </div>

        <button
          class="project-lightbox__nav project-lightbox__nav--prev"
          type="button"
          aria-label="Previous Roblox project"
          @click="showPreviousRobloxProject"
        >
          Previous
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
          Next
        </button>
      </div>
    </Transition>
  </Teleport>
</template>
