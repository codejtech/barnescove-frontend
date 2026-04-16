<template>
  <div class="p-6 max-w-2xl mx-auto">

    <Button icon="pi pi-arrow-left" label="All requests" text
      @click="$router.push('/dashboard/requests')" class="mb-4" />

    <div v-if="loading" class="flex justify-center py-20">
      <ProgressSpinner />
    </div>

    <div v-else-if="req" class="flex flex-col gap-5">

      <!-- ── Status banner ────────────────────────────────── -->
      <div :class="[bannerClass, 'rounded-xl p-4 flex items-center gap-3']">
        <i :class="[bannerIcon, 'text-2xl shrink-0']" />
        <div>
          <p class="font-semibold">{{ statusLabel }}</p>
          <p class="text-sm opacity-80">{{ statusMessage }}</p>
        </div>
      </div>

      <!-- ── Request details ──────────────────────────────── -->
      <div class="bg-surface-0 border border-surface-200 rounded-xl p-6 flex flex-col gap-4">
        <div class="flex items-start justify-between gap-3 flex-wrap">
          <h2 class="text-xl font-semibold text-surface-900">{{ req.title }}</h2>
          <Tag :severity="reqSeverity(req.status)" :value="req.status.replace('_', ' ')" />
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p class="text-xs text-surface-400 uppercase font-medium mb-1">Type</p>
            <p class="text-surface-900">{{ typeLabel(req.type) }}</p>
          </div>
          <div>
            <p class="text-xs text-surface-400 uppercase font-medium mb-1">Submitted</p>
            <p class="text-surface-900">{{ fmtDate(req.created_at) }}</p>
          </div>
          <div v-if="req.reviewed_at">
            <p class="text-xs text-surface-400 uppercase font-medium mb-1">Reviewed</p>
            <p class="text-surface-900">{{ fmtDate(req.reviewed_at) }}</p>
          </div>
        </div>

        <div>
          <p class="text-xs text-surface-400 uppercase font-medium mb-1">Your description</p>
          <p class="text-surface-700 leading-relaxed whitespace-pre-line">{{ req.description }}</p>
        </div>

        <!-- Admin notes -->
        <div v-if="req.admin_notes"
          class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-xs font-medium text-blue-700 uppercase mb-1">
            <i class="pi pi-comment mr-1" />HOA Board Notes
          </p>
          <p class="text-blue-900 text-sm leading-relaxed">{{ req.admin_notes }}</p>
        </div>
      </div>

      <!-- ── Attachments ──────────────────────────────────── -->
      <div v-if="req.attachments?.length"
        class="bg-surface-0 border border-surface-200 rounded-xl p-5">
        <h3 class="font-semibold text-surface-900 mb-3">
          Attachments
          <span class="text-surface-400 font-normal text-sm ml-1">({{ req.attachments.length }})</span>
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <a v-for="att in req.attachments" :key="att.id"
            :href="att.url" target="_blank"
            class="flex items-center gap-3 p-3 bg-surface-50 border border-surface-200
                   rounded-lg hover:bg-surface-100 transition-colors no-underline group">
            <!-- Thumbnail for images -->
            <img v-if="att.mime_type?.startsWith('image')"
              :src="att.url" :alt="att.filename"
              class="w-10 h-10 rounded object-cover shrink-0 bg-surface-200" />
            <i v-else class="pi pi-file-pdf text-red-500 text-xl shrink-0" />
            <div class="flex-1 min-w-0">
              <p class="text-sm text-surface-700 truncate group-hover:text-primary-700">{{ att.filename }}</p>
              <p class="text-xs text-surface-400">{{ fmtSize(att.size_bytes) }}</p>
            </div>
            <i class="pi pi-external-link text-surface-300 text-xs group-hover:text-primary-400" />
          </a>
        </div>
      </div>

      <!-- ── Timeline ─────────────────────────────────────── -->
      <div class="bg-surface-0 border border-surface-200 rounded-xl p-5">
        <h3 class="font-semibold text-surface-900 mb-4">Timeline</h3>
        <div class="flex flex-col gap-0">
          <TimelineItem
            icon="pi pi-send"
            :label="`Request submitted — ${fmtDate(req.created_at)}`"
            color="bg-primary-500"
            :last="!req.reviewed_at" />
          <TimelineItem v-if="['under_review','approved','rejected'].includes(req.status)"
            icon="pi pi-search"
            label="Under review by HOA board"
            color="bg-amber-500"
            :last="req.status === 'under_review'" />
          <TimelineItem v-if="req.status === 'approved'"
            icon="pi pi-check"
            :label="`Approved — ${fmtDate(req.reviewed_at)}`"
            color="bg-green-500"
            :last="true" />
          <TimelineItem v-if="req.status === 'rejected'"
            icon="pi pi-times"
            :label="`Rejected — ${fmtDate(req.reviewed_at)}`"
            color="bg-red-500"
            :last="true" />
        </div>
      </div>

    </div>

    <div v-else class="text-center py-20 text-surface-400">
      <i class="pi pi-exclamation-circle text-4xl mb-3 block" />
      <p>Request not found.</p>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api/axios'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'

// Simple inline timeline item component
const TimelineItem = {
  props: ['icon', 'label', 'color', 'last'],
  template: `
    <div class="flex gap-3">
      <div class="flex flex-col items-center">
        <div :class="[color, 'w-8 h-8 rounded-full flex items-center justify-center shrink-0']">
          <i :class="[icon, 'text-white text-xs']" />
        </div>
        <div v-if="!last" class="w-0.5 bg-surface-200 flex-1 my-1" style="min-height:24px" />
      </div>
      <p class="text-sm text-surface-700 pt-1.5 pb-4">{{ label }}</p>
    </div>
  `
}

const route   = useRoute()
const req     = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await api.get(`/change-requests/${route.params.id}`)
    req.value = data
  } catch {}
  finally { loading.value = false }
})

// Status banner config
const bannerClass = computed(() => ({
  submitted:    'bg-blue-50  border border-blue-200  text-blue-800',
  under_review: 'bg-amber-50 border border-amber-200 text-amber-800',
  approved:     'bg-green-50 border border-green-200 text-green-800',
  rejected:     'bg-red-50   border border-red-200   text-red-800',
}[req.value?.status] || 'bg-surface-50 border border-surface-200'))

const bannerIcon = computed(() => ({
  submitted:    'pi pi-clock       text-blue-500',
  under_review: 'pi pi-search      text-amber-500',
  approved:     'pi pi-check-circle text-green-500',
  rejected:     'pi pi-times-circle text-red-500',
}[req.value?.status] || 'pi pi-info-circle'))

const statusLabel = computed(() => ({
  submitted:    'Awaiting review',
  under_review: 'Under review',
  approved:     'Request approved',
  rejected:     'Request rejected',
}[req.value?.status] || ''))

const statusMessage = computed(() => ({
  submitted:    'Your request has been received and is in the queue for the HOA board.',
  under_review: 'The HOA board is currently reviewing your request.',
  approved:     'Great news — your request has been approved by the board.',
  rejected:     'Unfortunately your request was not approved. See the board notes below.',
}[req.value?.status] || ''))

const reqSeverity = s => ({ submitted:'info', under_review:'warning', approved:'success', rejected:'danger' }[s])
const typeLabel   = t => ({ curb_appeal:'Curb Appeal', lawn:'Lawn', home_addition:'Home Addition', other:'Other' }[t] || t)
const fmtDate     = d => new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })
const fmtSize     = b => b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.round(b / 1024) + ' KB'
</script>
