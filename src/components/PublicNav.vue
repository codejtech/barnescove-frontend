<template>
  <header class="bg-white border-b border-surface-200 sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
      <!-- Logo -->
      <RouterLink to="/" class="flex items-center gap-2 no-underline">
        <div class="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
          <i class="pi pi-home text-white text-sm" />
        </div>
        <span class="font-semibold text-surface-900">Barnes Cove HOA</span>
      </RouterLink>

      <!-- Desktop nav -->
      <nav class="hidden md:flex items-center gap-6">
        <RouterLink v-for="link in navLinks" :key="link.to" :to="link.to"
          class="text-sm text-surface-600 hover:text-surface-900 transition-colors no-underline"
          :class="{ 'text-surface-900 font-medium': $route.path === link.to }">
          {{ link.label }}
        </RouterLink>
      </nav>

      <!-- Auth buttons -->
      <div class="flex items-center gap-2">
        <template v-if="auth.isLoggedIn && auth.isActive">
          <RouterLink :to="auth.isAdmin ? '/admin' : '/dashboard'">
            <Button label="Dashboard" icon="pi pi-th-large" size="small" />
          </RouterLink>
        </template>
        <template v-else>
          <RouterLink to="/login">
            <Button label="Sign In" size="small" severity="secondary" />
          </RouterLink>
          <RouterLink to="/register" class="hidden sm:block">
            <Button label="Register" size="small" />
          </RouterLink>
        </template>

        <!-- Mobile menu toggle -->
        <Button icon="pi pi-bars" text rounded class="md:hidden"
          @click="mobileOpen = !mobileOpen" />
      </div>
    </div>

    <!-- Mobile menu -->
    <div v-if="mobileOpen" class="md:hidden border-t border-surface-200 bg-surface-0 px-6 py-4 flex flex-col gap-3">
      <RouterLink v-for="link in navLinks" :key="link.to" :to="link.to"
        class="text-sm text-surface-700 py-1 no-underline"
        @click="mobileOpen = false">
        {{ link.label }}
      </RouterLink>
      <RouterLink to="/register" class="mt-1">
        <Button label="Create Account" class="w-full" size="small" />
      </RouterLink>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Button from 'primevue/button'

const auth       = useAuthStore()
const mobileOpen = ref(false)

const navLinks = [
  { to: '/',       label: 'Home' },
  { to: '/about',  label: 'About' },
  { to: '/rules',  label: 'HOA Rules' },
  { to: '/faq',    label: 'FAQ' },
]
</script>
