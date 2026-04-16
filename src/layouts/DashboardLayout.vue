
<template>
  <div class="min-h-screen bg-surface-50 flex">

    <!-- ── Sidebar ─────────────────────────────────────────── -->
    <aside :class="[
      'fixed inset-y-0 left-0 z-40 flex flex-col bg-surface-0 border-r border-surface-200 transition-all duration-300',
      sidebarOpen ? 'w-64' : 'w-0 md:w-16 overflow-hidden'
    ]">
      <!-- Logo -->
      <div class="flex items-center gap-3 px-4 py-5 border-b border-surface-200 shrink-0">
        <div class="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
          <i class="pi pi-home text-white text-sm" />
        </div>
        <span v-if="sidebarOpen" class="font-semibold text-surface-900 whitespace-nowrap">Barnes Cove</span>
      </div>

      <!-- Nav links -->
      <nav class="flex-1 py-4 flex flex-col gap-1 px-2 overflow-y-auto">
        <RouterLink v-for="link in navLinks" :key="link.to" :to="link.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-surface-600 hover:bg-surface-100 hover:text-surface-900 transition-colors group"
          :class="{ 'bg-primary-50 !text-primary-700 font-medium': isActive(link.to) }">
          <i :class="[link.icon, 'text-lg shrink-0']" />
          <span v-if="sidebarOpen" class="whitespace-nowrap text-sm">{{ link.label }}</span>
        </RouterLink>
      </nav>

      <!-- User info + logout -->
      <div class="border-t border-surface-200 p-3 shrink-0">
        <div class="flex items-center gap-3">
          <Avatar :label="initials" shape="circle" class="shrink-0 bg-primary-100 text-primary-700" />
          <div v-if="sidebarOpen" class="flex-1 min-w-0">
            <p class="text-sm font-medium text-surface-900 truncate">{{ auth.user?.first_name }} {{ auth.user?.last_name }}</p>
            <p class="text-xs text-surface-400 truncate">{{ auth.user?.email }}</p>
          </div>
          <Button v-if="sidebarOpen" icon="pi pi-sign-out" text rounded size="small"
            severity="secondary" @click="logout" v-tooltip="'Sign out'" />
        </div>
      </div>
    </aside>

    <!-- ── Main content ───────────────────────────────────── -->
    <div :class="['flex-1 flex flex-col transition-all duration-300', sidebarOpen ? 'md:ml-64' : 'md:ml-16']">

      <!-- Top bar -->
      <header class="sticky top-0 z-30 bg-surface-0 border-b border-surface-200 px-4 py-3 flex items-center gap-3">
        <Button icon="pi pi-bars" text rounded @click="sidebarOpen = !sidebarOpen"
          class="text-surface-600" />
        <h1 class="text-base font-semibold text-surface-900 flex-1">{{ pageTitle }}</h1>
        <!-- HOA fee badge -->
        <RouterLink v-if="!hasPaidThisYear" to="/dashboard/payments">
          <Tag severity="warning" value="HOA fee due" icon="pi pi-exclamation-circle" class="cursor-pointer" />
        </RouterLink>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto">
        <RouterView />
      </main>
    </div>

    <!-- Mobile overlay -->
    <div v-if="sidebarOpen" class="fixed inset-0 bg-black/30 z-30 md:hidden"
      @click="sidebarOpen = false" />

    <Toast position="top-right" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/api/axios'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'

const auth       = useAuthStore()
const route      = useRoute()
const router     = useRouter()
const sidebarOpen = ref(true)
const hasPaidThisYear = ref(true)

const navLinks = [
  { to: '/dashboard/home',     icon: 'pi pi-home',          label: 'Dashboard' },
  { to: '/dashboard/payments', icon: 'pi pi-credit-card',   label: 'HOA Payments' },
  { to: '/dashboard/requests', icon: 'pi pi-file-edit',     label: 'Change Requests' },
  { to: '/board',              icon: 'pi pi-comments',      label: 'Message Board' },
  { to: '/dashboard/account',  icon: 'pi pi-user',          label: 'My Account' },
]

const pageTitles = {
  '/dashboard/home':     'Dashboard',
  '/dashboard/payments': 'HOA Payments',
  '/dashboard/requests': 'Change Requests',
  '/board':              'Message Board',
  '/dashboard/account':  'My Account',
}

const pageTitle = computed(() =>
  pageTitles[route.path] || route.path.startsWith('/board/') ? 'Announcement' : 'Barnes Cove HOA'
)

const initials = computed(() => {
  const u = auth.user
  return u ? (u.first_name[0] + u.last_name[0]).toUpperCase() : '?'
})

const isActive = (to) => route.path === to || route.path.startsWith(to + '/')

async function logout() {
  await auth.logout()
  router.push('/login')
}

onMounted(async () => {
  // Check if resident has paid for the current year
  const year = new Date().getFullYear()
  try {
    const { data } = await api.get('/payments')
    hasPaidThisYear.value = data.some(p => p.fee_year === year && p.status === 'paid')
  } catch {}
})
</script>
