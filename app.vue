<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage :page-key="(route) => route.fullPath" />
  </NuxtLayout>
</template>
