<template>
  <div class="min-h-screen flex flex-col">
    <PublicNav />
    <div class="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
      <p class="text-8xl font-bold text-surface-200 mb-4">404</p>
      <h1 class="text-2xl font-semibold text-surface-900 mb-2">Page not found</h1>
      <p class="text-surface-500 mb-8 max-w-sm">
        We couldn't find that page. It may have moved or the link might be incorrect.
      </p>
      <div class="flex gap-3">
        <Button label="Go Home" icon="pi pi-home" @click="$router.push('/')" />
        <Button label="Go Back" icon="pi pi-arrow-left" severity="secondary" @click="$router.back()" />
      </div>
    </div>
    <PublicFooter />
  </div>
</template>

<script setup>
import PublicNav from '@/components/PublicNav.vue'
import PublicFooter from '@/components/PublicFooter.vue'
import Button from 'primevue/button'
</script>
