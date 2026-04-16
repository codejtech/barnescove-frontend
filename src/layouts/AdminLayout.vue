<template>
  <div class="min-h-screen bg-surface-50 flex">

    <!-- ── Admin Sidebar ──────────────────────────────────── -->
    <aside :class="[
      'fixed inset-y-0 left-0 z-40 flex flex-col bg-surface-900 transition-all duration-300',
      sidebarOpen ? 'w-64' : 'w-0 md:w-16 overflow-hidden'
    ]">
      <!-- Logo -->
      <div class="flex items-center gap-3 px-4 py-5 border-b border-surface-700 shrink-0">
        <div class="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
          <i class="pi pi-shield text-white text-sm" />
        </div>
        <div v-if="sidebarOpen">
          <p class="font-semibold text-white whitespace-nowrap text-sm">Barnes Cove</p>
          <p class="text-xs text-surface-400">Admin Panel</p>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 py-4 flex flex-col gap-1 px-2 overflow-y-auto">
        <RouterLink v-for="link in adminLinks" :key="link.to" :to="link.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-surface-400 hover:bg-surface-700 hover:text-white transition-colors"
          :class="{ 'bg-surface-700 !text-white': isActive(link.to) }">
          <i :class="[link.icon, 'text-lg shrink-0']" />
          <span v-if="sidebarOpen" class="whitespace-nowrap text-sm">{{ link.label }}</span>
          <!-- Pending badge -->
          <span v-if="link.badge && pendingCount > 0 && sidebarOpen"
            class="ml-auto bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            {{ pendingCount }}
          </span>
        </RouterLink>

        <!-- Divider -->
        <div class="border-t border-surface-700 my-2" />

        <!-- Back to resident view -->
        <RouterLink to="/dashboard"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-surface-500 hover:text-surface-300 transition-colors text-sm">
          <i class="pi pi-arrow-left text-lg shrink-0" />
          <span v-if="sidebarOpen">Resident view</span>
        </RouterLink>
      </nav>

      <!-- Admin user -->
      <div class="border-t border-surface-700 p-3 shrink-0">
        <div class="flex items-center gap-3">
          <Avatar :label="initials" shape="circle" class="shrink-0 bg-amber-500 text-white" />
          <div v-if="sidebarOpen" class="flex-1 min-w-0">
            <p class="text-sm font-medium text-white truncate">{{ auth.user?.first_name }} {{ auth.user?.last_name }}</p>
            <p class="text-xs text-surface-400">Administrator</p>
          </div>
          <Button v-if="sidebarOpen" icon="pi pi-sign-out" text rounded size="small"
            class="text-surface-400 hover:text-white" @click="logout" />
        </div>
      </div>
    </aside>

    <!-- ── Main ───────────────────────────────────────────── -->
    <div :class="['flex-1 flex flex-col transition-all duration-300', sidebarOpen ? 'md:ml-64' : 'md:ml-16']">
      <header class="sticky top-0 z-30 bg-surface-0 border-b border-surface-200 px-4 py-3 flex items-center gap-3">
        <Button icon="pi pi-bars" text rounded @click="sidebarOpen = !sidebarOpen" />
        <h1 class="text-base font-semibold text-surface-900 flex-1">{{ pageTitle }}</h1>
        <Tag v-if="pendingCount > 0" :value="`${pendingCount} pending approvals`"
          severity="warning" icon="pi pi-clock" />
      </header>

      <main class="flex-1 overflow-y-auto">
        <RouterView />
      </main>
    </div>

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

const auth        = useAuthStore()
const route       = useRoute()
const router      = useRouter()
const sidebarOpen = ref(true)
const pendingCount = ref(0)

const adminLinks = [
  { to: '/admin/users',    icon: 'pi pi-users',      label: 'Residents',     badge: true },
  { to: '/admin/requests', icon: 'pi pi-file-edit',  label: 'Change Requests' },
  { to: '/admin/posts',    icon: 'pi pi-megaphone',  label: 'Announcements' },
]

const pageTitles = {
  '/admin/users':    'Resident Management',
  '/admin/requests': 'Change Requests',
  '/admin/posts':    'Announcements',
}

const pageTitle  = computed(() => pageTitles[route.path] || 'Admin Panel')
const initials   = computed(() => {
  const u = auth.user
  return u ? (u.first_name[0] + u.last_name[0]).toUpperCase() : 'A'
})
const isActive   = (to) => route.path === to || route.path.startsWith(to + '/')

async function logout() {
  await auth.logout()
  router.push('/login')
}

onMounted(async () => {
  try {
    const { data } = await api.get('/admin/users', { params: { status: 'pending' } })
    pendingCount.value = data.total || 0
  } catch {}
})
</script>
