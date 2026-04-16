<template>
  <div class="p-6">
    <h2 class="text-2xl font-semibold mb-1">Change Requests</h2>
    <p class="text-surface-500 mb-6">Review and respond to resident change requests.</p>

    <!-- ── Filters ────────────────────────────────────────── -->
    <div class="flex gap-3 mb-5 flex-wrap">
      <div class="flex gap-1 p-1 bg-surface-100 rounded-lg">
        <button v-for="opt in statusOptions" :key="opt.value"
          @click="setStatus(opt.value)"
          :class="[
            'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            activeStatus === opt.value
              ? 'bg-surface-0 text-surface-900 shadow-sm'
              : 'text-surface-500 hover:text-surface-700'
          ]">
          {{ opt.label }}
          <span v-if="opt.count !== undefined"
            class="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
            :class="activeStatus === opt.value ? 'bg-primary-100 text-primary-700' : 'bg-surface-200 text-surface-500'">
            {{ opt.count }}
          </span>
        </button>
      </div>
      <Select v-model="typeFilter" :options="typeOptions" optionLabel="label" optionValue="value"
        placeholder="All types" @change="load" class="w-44" />
    </div>

    <!-- ── Table ──────────────────────────────────────────── -->
    <DataTable :value="requests" :loading="loading" stripedRows
      :rowClass="row => row.id === highlightId ? 'bg-amber-50' : ''"
      responsiveLayout="scroll">

      <Column header="Resident">
        <template #body="{ data }">
          <div>
            <p class="text-sm font-medium text-surface-900">
              {{ data.user?.first_name }} {{ data.user?.last_name }}
            </p>
            <p class="text-xs text-surface-400">{{ data.user?.street_address }}</p>
          </div>
        </template>
      </Column>

      <Column field="title" header="Request" />

      <Column header="Type">
        <template #body="{ data }">{{ typeLabel(data.type) }}</template>
      </Column>

      <Column header="Status">
        <template #body="{ data }">
          <Tag :severity="reqSeverity(data.status)" :value="data.status.replace('_',' ')" />
        </template>
      </Column>

      <Column header="Submitted">
        <template #body="{ data }">{{ fmtDate(data.created_at) }}</template>
      </Column>

      <Column header="Attachments">
        <template #body="{ data }">
          <span class="text-sm text-surface-500">
            {{ data.attachments?.length || 0 }}
            <i v-if="data.attachments?.length" class="pi pi-paperclip ml-1" />
          </span>
        </template>
      </Column>

      <Column header="Actions">
        <template #body="{ data }">
          <Button icon="pi pi-eye" text rounded size="small" @click="openDetail(data)"
            v-tooltip="'Review request'" />
        </template>
      </Column>

    </DataTable>

    <Paginator :rows="20" :totalRecords="total" @page="onPage" class="mt-4" />

    <!-- ── Review drawer / dialog ─────────────────────────── -->
    <Dialog v-model="showDetail" :header="`Request: ${selected?.title}`"
      modal class="w-full max-w-2xl" :draggable="false">
      <div v-if="selected" class="flex flex-col gap-5 pt-2">

        <!-- Meta -->
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-xs text-surface-400 uppercase font-medium mb-1">Resident</p>
            <p class="text-surface-900 font-medium">{{ selected.user?.first_name }} {{ selected.user?.last_name }}</p>
            <p class="text-surface-500">{{ selected.user?.street_address }}</p>
          </div>
          <div>
            <p class="text-xs text-surface-400 uppercase font-medium mb-1">Type</p>
            <p class="text-surface-900">{{ typeLabel(selected.type) }}</p>
          </div>
          <div class="col-span-2">
            <p class="text-xs text-surface-400 uppercase font-medium mb-1">Description</p>
            <p class="text-surface-700 leading-relaxed">{{ selected.description }}</p>
          </div>
        </div>

        <!-- Attachments -->
        <div v-if="selected.attachments?.length">
          <p class="text-xs text-surface-400 uppercase font-medium mb-2">Attachments</p>
          <div class="flex flex-col gap-2">
            <a v-for="att in selected.attachments" :key="att.id"
              :href="att.url" target="_blank"
              class="flex items-center gap-3 p-3 bg-surface-50 border border-surface-200
                     rounded-lg hover:bg-surface-100 transition-colors no-underline">
              <i :class="att.mime_type?.startsWith('image') ? 'pi pi-image' : 'pi pi-file-pdf'"
                class="text-surface-500" />
              <span class="text-sm text-surface-700 flex-1 truncate">{{ att.filename }}</span>
              <i class="pi pi-external-link text-surface-400 text-xs" />
            </a>
          </div>
        </div>

        <Divider />

        <!-- Review form -->
        <div class="flex flex-col gap-3">
          <p class="font-medium text-surface-900">Board Decision</p>

          <div class="flex gap-2 flex-wrap">
            <button v-for="opt in decisionOptions" :key="opt.value"
              @click="reviewForm.status = opt.value"
              :class="[
                'flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
                reviewForm.status === opt.value ? opt.activeClass : 'border-surface-200 text-surface-600 hover:border-surface-300'
              ]">
              <i :class="opt.icon" />
              {{ opt.label }}
            </button>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium">
              Notes to resident
              <span class="text-surface-400 font-normal">(optional)</span>
            </label>
            <Textarea v-model="reviewForm.admin_notes" rows="3"
              placeholder="Add any notes or conditions for the resident..." />
          </div>

          <div class="flex justify-end gap-2 pt-1">
            <Button label="Cancel" severity="secondary" @click="showDetail = false" />
            <Button label="Submit decision" :loading="submitting"
              :disabled="!reviewForm.status" @click="submitReview" />
          </div>
        </div>

      </div>
    </Dialog>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import api from '@/api/axios'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Select from 'primevue/select'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import Divider from 'primevue/divider'
import Paginator from 'primevue/paginator'

const route       = useRoute()
const toast       = useToast()
const requests    = ref([])
const loading     = ref(true)
const total       = ref(0)
const page        = ref(1)
const activeStatus= ref('')
const typeFilter  = ref('')
const showDetail  = ref(false)
const selected    = ref(null)
const submitting  = ref(false)
const counts      = ref({ submitted: 0, under_review: 0, approved: 0, rejected: 0 })

// Highlight a row if navigated from UserDetail
const highlightId = computed(() => Number(route.query.highlight) || null)

const reviewForm = ref({ status: '', admin_notes: '' })

const statusOptions = computed(() => [
  { label: 'All',          value: '' },
  { label: 'Submitted',    value: 'submitted',    count: counts.value.submitted },
  { label: 'Under review', value: 'under_review', count: counts.value.under_review },
  { label: 'Approved',     value: 'approved',     count: counts.value.approved },
  { label: 'Rejected',     value: 'rejected',     count: counts.value.rejected },
])

const typeOptions = [
  { label: 'All types',        value: '' },
  { label: 'Curb Appeal',      value: 'curb_appeal' },
  { label: 'Lawn',             value: 'lawn' },
  { label: 'Home Addition',    value: 'home_addition' },
  { label: 'Other',            value: 'other' },
]

const decisionOptions = [
  {
    value: 'under_review',
    label: 'Mark under review',
    icon: 'pi pi-clock',
    activeClass: 'border-amber-400 bg-amber-50 text-amber-700',
  },
  {
    value: 'approved',
    label: 'Approve',
    icon: 'pi pi-check',
    activeClass: 'border-green-400 bg-green-50 text-green-700',
  },
  {
    value: 'rejected',
    label: 'Reject',
    icon: 'pi pi-times',
    activeClass: 'border-red-400 bg-red-50 text-red-700',
  },
]

async function load() {
  loading.value = true
  const params = { page: page.value }
  if (activeStatus.value) params.status  = activeStatus.value
  if (typeFilter.value)   params.type    = typeFilter.value
  const { data } = await api.get('/admin/change-requests', { params })
  requests.value = data.data
  total.value    = data.total
  loading.value  = false
}

async function loadCounts() {
  // Fire 4 tiny requests in parallel to get status counts
  const statuses = ['submitted','under_review','approved','rejected']
  const results  = await Promise.all(
    statuses.map(s => api.get('/admin/change-requests', { params: { status: s, page: 1 } }))
  )
  statuses.forEach((s, i) => { counts.value[s] = results[i].data.total })
}

function setStatus(s) { activeStatus.value = s; page.value = 1; load() }
function onPage(e)    { page.value = e.page + 1; load() }

function openDetail(row) {
  selected.value   = row
  reviewForm.value = { status: row.status === 'submitted' ? '' : row.status, admin_notes: row.admin_notes || '' }
  showDetail.value = true
}

async function submitReview() {
  submitting.value = true
  try {
    await api.post(`/admin/change-requests/${selected.value.id}/review`, reviewForm.value)
    toast.add({ severity: 'success', summary: 'Decision saved',
      detail: 'Resident has been notified by email.', life: 3000 })
    showDetail.value = false
    await Promise.all([load(), loadCounts()])
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Could not save decision.', life: 3000 })
  } finally { submitting.value = false }
}

const reqSeverity = s => ({ submitted:'info', under_review:'warning', approved:'success', rejected:'danger' }[s])
const typeLabel   = t => ({ curb_appeal:'Curb Appeal', lawn:'Lawn', home_addition:'Home Addition', other:'Other' }[t] || t)
const fmtDate     = d => new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })

onMounted(() => Promise.all([load(), loadCounts()]))
</script>
