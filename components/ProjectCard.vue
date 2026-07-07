<script setup lang="ts">
import type { Project } from '~/data/portfolio'

defineProps<{
  project: Project
  index?: number
}>()
</script>

<template>
  <article class="project-card">
    <a :href="project.artstationUrl" target="_blank" rel="noreferrer" class="project-card__media">
      <img :src="project.cover" :alt="`${project.title} artwork by Ali Taha Yapışkan`" loading="lazy">
      <span class="project-card__index">{{ String((index ?? 0) + 1).padStart(2, '0') }}</span>
    </a>

    <div class="project-card__body">
      <div>
        <p class="eyebrow">{{ project.year }} / {{ project.category }}</p>
        <h3>{{ project.title }}</h3>
      </div>

      <p>{{ project.description }}</p>

      <div class="tag-list" aria-label="Project tags">
        <span v-for="tag in project.tags.slice(0, 4)" :key="tag">{{ tag }}</span>
      </div>
    </div>
  </article>
</template>
