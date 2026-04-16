<template>
  <div class="p-6 max-w-2xl mx-auto">
    <Button icon="pi pi-arrow-left" label="All requests" text @click="$router.back()" class="mb-4" />

    <div v-if="loading" class="flex justify-center py-16"><ProgressSpinner /></div>

    <div v-else-if="req" class="flex flex-col gap-5">
      <div class="bg-surface-0 border border-surface-200 rounded-xl p-6">
        <div class="flex items-start justify-between gap-4 mb-4">
          <h2 class="text-xl font-semibold text-surface-900">{{ req.title }}</h2>
          <Tag :severity="reqSeverity(req.status)" :value="req.status.replace('_',' ')" />
        </div>
        <div class="grid grid-cols-2 gap-3 text-sm mb-4">
          <div><p class="text-surface-400 text-xs uppercase font-medium">Type</p>
            <p class="text-surface-900 mt-0.5">{{ typeLabel(req.type) }}</p></div>
          <div><p class="text-surface-400 text-xs uppercase font-medium">Submitted</p>
            <p class="text-surface-900 mt-0.5">{{ fmtDate(req.created_at) }}</p></div>
        </div>
        <p class="text-surface-400 text-xs uppercase font-medium mb-1">Description</p>
        <p class="text-surface-700 leading-relaxed">{{ req.description }}</p>

        <!-- Admin notes -->
        <div v-if="req.admin_notes" class="mt-4 p-4 bg-surface-50 border border-surface-200 rounded-lg">
          <p class="text-xs font-medium text-surface-400 uppercase mb-1">HOA Board Notes</p>
          <p class="text-surface-700 text-sm">{{ req.admin_notes }}</p>
        </div>
      </div>

      <!-- Attachments -->
      <div v-if="req.attachments?.length" class="bg-surface-0 border border-surface-200 rounded-xl p-5">
        <h3 class="font-semibold text-surface-900 mb-3">Attachments</h3>
        <div class="flex flex-col gap-2">
          <a v-for="att in req.attachments" :key="att.id" :href="att.url" target="_blank"
            class="flex items-center gap-3 p-3 bg-surface-50 rounded-lg hover:bg-surface-100 transition-colors no-underline">
            <i :class="att.mime_type.startsWith('image') ? 'pi pi-image' : 'pi pi-file-pdf'"
              class="text-surface-500" />
            <span class="text-sm text-surface-700 flex-1 truncate">{{ att.filename }}</span>
            <i class="pi pi-external-link text-surface-400 text-xs" />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api/axios'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'

const route   = useRoute()
const req     = ref(null)
const loading = ref(true)

onMounted(async () => {
  const { data } = await api.get(`/change-requests/${route.params.id}`)
  req.value = data
  loading.value = false
})

const reqSeverity = s => ({ submitted:'info', under_review:'warning', approved:'success', rejected:'danger' }[s])
const typeLabel   = t => ({ curb_appeal:'Curb Appeal', lawn:'Lawn', home_addition:'Home Addition', other:'Other' }[t] || t)
const fmtDate     = d => new Date(d).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})
</script>
