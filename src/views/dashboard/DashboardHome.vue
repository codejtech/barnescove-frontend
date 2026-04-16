<template>
  <div class="p-6 max-w-4xl mx-auto">
    <!-- Welcome banner -->
    <div class="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 text-white mb-6">
      <h2 class="text-2xl font-semibold mb-1">
        Welcome back, {{ auth.user?.first_name }}!
      </h2>
      <p class="text-primary-100 text-sm">
        {{ address }} · Member since {{ memberSince }}
      </p>
    </div>

    <!-- Quick stat cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <StatCard icon="pi pi-credit-card" label="HOA Fee" :color="feeColor"
        :value="hasPaid ? `${currentYear} Paid` : `${currentYear} Due`" />
      <StatCard icon="pi pi-file-edit" label="Open Requests"
        :value="String(openRequests)" color="text-blue-600 bg-blue-50" />
      <StatCard icon="pi pi-comments" label="New Posts"
        :value="String(recentPosts)" color="text-amber-600 bg-amber-50" />
    </div>

    <!-- Two-column: recent posts + recent requests -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

      <!-- Recent announcements -->
      <div class="bg-surface-0 border border-surface-200 rounded-xl p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-surface-900">Recent Announcements</h3>
          <RouterLink to="/board" class="text-sm text-primary-600 hover:underline">View all</RouterLink>
        </div>
        <div v-if="posts.length" class="flex flex-col gap-3">
          <div v-for="post in posts" :key="post.id"
            class="flex gap-3 cursor-pointer hover:bg-surface-50 p-2 rounded-lg -mx-2 transition-colors"
            @click="$router.push('/board/'+post.id)">
            <div class="w-2 h-2 rounded-full mt-2 shrink-0"
              :class="post.category === 'urgent' ? 'bg-red-500' : 'bg-primary-500'" />
            <div>
              <p class="text-sm font-medium text-surface-900 line-clamp-1">{{ post.title }}</p>
              <p class="text-xs text-surface-400">{{ fmtDate(post.published_at) }}</p>
            </div>
          </div>
        </div>
        <p v-else class="text-sm text-surface-400 text-center py-4">No recent announcements.</p>
      </div>

      <!-- My requests -->
      <div class="bg-surface-0 border border-surface-200 rounded-xl p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-surface-900">My Requests</h3>
          <RouterLink to="/dashboard/requests" class="text-sm text-primary-600 hover:underline">View all</RouterLink>
        </div>
        <div v-if="requests.length" class="flex flex-col gap-3">
          <div v-for="req in requests" :key="req.id"
            class="flex items-center justify-between cursor-pointer hover:bg-surface-50 p-2 rounded-lg -mx-2 transition-colors"
            @click="$router.push('/dashboard/requests/'+req.id)">
            <div>
              <p class="text-sm font-medium text-surface-900 line-clamp-1">{{ req.title }}</p>
              <p class="text-xs text-surface-400">{{ fmtDate(req.created_at) }}</p>
            </div>
            <Tag :severity="reqSeverity(req.status)" :value="req.status.replace('_',' ')" class="text-xs shrink-0" />
          </div>
        </div>
        <div v-else class="text-center py-4">
          <p class="text-sm text-surface-400 mb-2">No requests yet.</p>
          <RouterLink to="/dashboard/requests">
            <Button label="Submit a request" size="small" severity="secondary" />
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Pay fee CTA -->
    <div v-if="!hasPaid" class="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-center justify-between gap-4">
      <div>
        <p class="font-semibold text-surface-900">{{ currentYear }} HOA fee is due</p>
        <p class="text-sm text-surface-500">Annual dues are ${{ HOA_FEE }}. Pay securely via Stripe.</p>
      </div>
      <RouterLink to="/dashboard/payments">
        <Button label="Pay Now" icon="pi pi-credit-card" />
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/api/axios'
import Button from 'primevue/button'
import Tag from 'primevue/tag'

// Inline StatCard
const StatCard = {
  props: ['icon','label','value','color'],
  template: `<div class="bg-surface-0 border border-surface-200 rounded-xl p-4 flex items-center gap-3">
    <div :class="['w-10 h-10 rounded-lg flex items-center justify-center shrink-0', color]">
      <i :class="[icon, 'text-xl']" />
    </div>
    <div><p class="text-lg font-semibold text-surface-900">{{ value }}</p>
    <p class="text-xs text-surface-400">{{ label }}</p></div>
  </div>`
}

const HOA_FEE     = 350
const currentYear = new Date().getFullYear()
const auth        = useAuthStore()
const hasPaid     = ref(false)
const posts       = ref([])
const requests    = ref([])

const address      = computed(() => auth.user?.street_address || '')
const memberSince  = computed(() => auth.user ? new Date(auth.user.created_at).getFullYear() : '')
const openRequests = computed(() => requests.value.filter(r => ['submitted','under_review'].includes(r.status)).length)
const recentPosts  = computed(() => posts.value.length)
const feeColor     = computed(() => hasPaid.value ? 'text-green-600 bg-green-50' : 'text-amber-600 bg-amber-50')

onMounted(async () => {
  const [paymentsRes, postsRes, reqRes] = await Promise.all([
    api.get('/payments'),
    api.get('/posts', { params: { page: 1 } }),
    api.get('/change-requests', { params: { page: 1 } }),
  ])
  hasPaid.value  = paymentsRes.data.some(p => p.fee_year === currentYear && p.status === 'paid')
  posts.value    = postsRes.data.data.slice(0, 4)
  requests.value = reqRes.data.data.slice(0, 4)
})

const reqSeverity = s => ({ submitted:'info', under_review:'warning', approved:'success', rejected:'danger' }[s])
const fmtDate = d => new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'})
</script>
