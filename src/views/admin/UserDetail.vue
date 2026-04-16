
<template>
  <div class="p-6 max-w-3xl mx-auto">

    <Button icon="pi pi-arrow-left" label="All residents" text @click="$router.back()" class="mb-4" />

    <div v-if="loading" class="flex justify-center py-20">
      <ProgressSpinner />
    </div>

    <div v-else-if="user" class="flex flex-col gap-5">

      <!-- ── Header card ──────────────────────────────────── -->
      <div class="bg-surface-0 border border-surface-200 rounded-xl p-6">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div class="flex items-center gap-4">
            <Avatar :label="initials" shape="circle" size="large"
              class="bg-primary-100 text-primary-700 text-xl font-semibold shrink-0" />
            <div>
              <h2 class="text-xl font-semibold text-surface-900">
                {{ user.first_name }} {{ user.last_name }}
              </h2>
              <p class="text-surface-500 text-sm">{{ user.email }}</p>
              <p class="text-surface-400 text-xs mt-0.5">{{ user.phone || 'No phone on file' }}</p>
            </div>
          </div>
          <Tag :severity="statusSeverity(user.status)" :value="user.status" class="capitalize" />
        </div>

        <!-- Address / lot -->
        <div class="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 border-t border-surface-100">
          <div>
            <p class="text-xs font-medium text-surface-400 uppercase tracking-wide mb-1">Address</p>
            <p class="text-surface-900 text-sm">{{ user.street_address }}</p>
            <p class="text-surface-500 text-sm">{{ user.city }}, {{ user.state }} {{ user.zip }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-surface-400 uppercase tracking-wide mb-1">Lot number</p>
            <p class="text-surface-900 text-sm">{{ user.lot_number || '—' }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-surface-400 uppercase tracking-wide mb-1">Member since</p>
            <p class="text-surface-900 text-sm">{{ fmtDate(user.created_at) }}</p>
          </div>
        </div>

        <!-- Approved by -->
        <div v-if="user.approved_at" class="mt-4 text-xs text-surface-400">
          Approved on {{ fmtDate(user.approved_at) }}
        </div>

        <!-- Rejection reason -->
        <div v-if="user.rejection_reason"
          class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <span class="font-medium">Rejection reason:</span> {{ user.rejection_reason }}
        </div>
      </div>

      <!-- ── Action buttons ───────────────────────────────── -->
      <div class="flex gap-2 flex-wrap">
        <Button v-if="user.status === 'pending'" label="Approve account" icon="pi pi-check"
          severity="success" :loading="actionLoading" @click="approve" />
        <Button v-if="user.status === 'pending'" label="Reject account" icon="pi pi-times"
          severity="danger" outlined :loading="actionLoading" @click="rejectDialog = true" />
        <Button v-if="user.status === 'active'" label="Suspend account" icon="pi pi-ban"
          severity="warning" outlined :loading="actionLoading" @click="suspend" />
        <Button v-if="user.status === 'suspended' || user.status === 'rejected'"
          label="Re-activate account" icon="pi pi-refresh"
          severity="success" outlined :loading="actionLoading" @click="approve" />
      </div>

      <!-- ── Payment history ──────────────────────────────── -->
      <div class="bg-surface-0 border border-surface-200 rounded-xl p-5">
        <h3 class="font-semibold text-surface-900 mb-4">Payment History</h3>
        <DataTable :value="user.payments" v-if="user.payments?.length" stripedRows size="small">
          <Column field="fee_year" header="Year" />
          <Column header="Amount">
            <template #body="{ data }">${{ (data.amount_cents / 100).toFixed(2) }}</template>
          </Column>
          <Column header="Status">
            <template #body="{ data }">
              <Tag :severity="paymentSeverity(data.status)" :value="data.status" />
            </template>
          </Column>
          <Column header="Paid on">
            <template #body="{ data }">{{ data.paid_at ? fmtDate(data.paid_at) : '—' }}</template>
          </Column>
          <Column header="Receipt">
            <template #body="{ data }">
              <a v-if="data.receipt_url" :href="data.receipt_url" target="_blank"
                class="text-primary-600 hover:underline text-sm">View</a>
              <span v-else class="text-surface-400 text-sm">—</span>
            </template>
          </Column>
        </DataTable>
        <p v-else class="text-sm text-surface-400 text-center py-4">No payments on record.</p>
      </div>

      <!-- ── Change requests ──────────────────────────────── -->
      <div class="bg-surface-0 border border-surface-200 rounded-xl p-5">
        <h3 class="font-semibold text-surface-900 mb-4">Change Requests</h3>
        <DataTable :value="user.change_requests" v-if="user.change_requests?.length" stripedRows size="small">
          <Column field="title" header="Title" />
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
          <Column>
            <template #body="{ data }">
              <Button icon="pi pi-eye" text rounded size="small"
                @click="$router.push('/admin/requests?highlight='+data.id)" />
            </template>
          </Column>
        </DataTable>
        <p v-else class="text-sm text-surface-400 text-center py-4">No change requests submitted.</p>
      </div>
    </div>

    <!-- ── Reject dialog ────────────────────────────────────── -->
    <Dialog v-model="rejectDialog" header="Reject Account" modal
      class="w-full max-w-md" :draggable="false">
      <div class="flex flex-col gap-4 pt-2">
        <p class="text-surface-600 text-sm">
          This will reject <strong>{{ user?.first_name }} {{ user?.last_name }}'s</strong>
          application and send them an email with your reason.
        </p>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium">Reason for rejection</label>
          <Textarea v-model="rejectReason" rows="4"
            placeholder="e.g. Address not found in the Barnes Cove HOA property roster." />
        </div>
        <div class="flex justify-end gap-2">
          <Button label="Cancel" severity="secondary" @click="rejectDialog = false" />
          <Button label="Reject account" severity="danger"
            :disabled="!rejectReason.trim()" :loading="actionLoading" @click="reject" />
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
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import ProgressSpinner from 'primevue/progressspinner'

const route        = useRoute()
const toast        = useToast()
const user         = ref(null)
const loading      = ref(true)
const actionLoading= ref(false)
const rejectDialog = ref(false)
const rejectReason = ref('')

const initials = computed(() => {
  if (!user.value) return '?'
  return (user.value.first_name[0] + user.value.last_name[0]).toUpperCase()
})

async function load() {
  loading.value = true
  const { data } = await api.get(`/admin/users/${route.params.id}`)
  user.value    = data
  loading.value = false
}

async function approve() {
  actionLoading.value = true
  try {
    await api.post(`/admin/users/${user.value.id}/approve`)
    toast.add({ severity:'success', summary:'Approved',
      detail:`${user.value.first_name}'s account is now active.`, life:3000 })
    await load()
  } finally { actionLoading.value = false }
}

async function reject() {
  if (!rejectReason.value.trim()) return
  actionLoading.value = true
  try {
    await api.post(`/admin/users/${user.value.id}/reject`, { reason: rejectReason.value })
    toast.add({ severity:'info', summary:'Rejected', detail:'User has been notified by email.', life:3000 })
    rejectDialog.value = false
    rejectReason.value = ''
    await load()
  } finally { actionLoading.value = false }
}

async function suspend() {
  actionLoading.value = true
  try {
    await api.post(`/admin/users/${user.value.id}/suspend`)
    toast.add({ severity:'warn', summary:'Suspended',
      detail:`${user.value.first_name}'s account has been suspended.`, life:3000 })
    await load()
  } finally { actionLoading.value = false }
}

const statusSeverity  = s => ({ active:'success', pending:'warning', rejected:'danger', suspended:'secondary' }[s])
const paymentSeverity = s => ({ paid:'success', pending:'warning', failed:'danger', refunded:'info' }[s])
const reqSeverity     = s => ({ submitted:'info', under_review:'warning', approved:'success', rejected:'danger' }[s])
const typeLabel       = t => ({ curb_appeal:'Curb Appeal', lawn:'Lawn', home_addition:'Home Addition', other:'Other' }[t] || t)
const fmtDate         = d => new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })

onMounted(load)
</script>
