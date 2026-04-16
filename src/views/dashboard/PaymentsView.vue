<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h2 class="text-2xl font-semibold mb-1">HOA Payments</h2>
    <p class="text-surface-500 mb-6">Annual fee: <strong>${{ HOA_FEE }}</strong> / year</p>

    <!-- Current year status banner -->
    <div :class="hasPaidThisYear ? 'bg-green-50 border-green-300' : 'bg-amber-50 border-amber-300'"
      class="border rounded-xl p-4 flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <i :class="hasPaidThisYear ? 'pi pi-check-circle text-green-600' : 'pi pi-exclamation-circle text-amber-600'"
          class="text-2xl" />
        <div>
          <p class="font-semibold">{{ currentYear }} HOA Fee</p>
          <p class="text-sm text-surface-500">{{ hasPaidThisYear ? 'Paid — thank you!' : 'Payment due' }}</p>
        </div>
      </div>
      <Button v-if="!hasPaidThisYear" label="Pay Now" icon="pi pi-credit-card"
        :loading="payLoading" @click="startCheckout" />
    </div>

    <!-- Payment history -->
    <h3 class="text-lg font-semibold mb-3">Payment History</h3>
    <DataTable :value="payments" :loading="loading" stripedRows>
      <Column field="fee_year" header="Year" />
      <Column field="amount_formatted" header="Amount" />
      <Column header="Status">
        <template #body="{ data }">
          <Tag :severity="statusSeverity(data.status)" :value="data.status" />
        </template>
      </Column>
      <Column header="Date">
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

    <div class="mt-4">
      <Button label="Manage Billing / Past Receipts" severity="secondary" icon="pi pi-external-link"
        @click="openPortal" />
    </div>
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

const HOA_FEE     = 350
const currentYear = new Date().getFullYear()
const toast       = useToast()
const route       = useRoute()
const payments    = ref([])
const loading     = ref(true)
const payLoading  = ref(false)

const hasPaidThisYear = computed(() =>
  payments.value.some(p => p.fee_year === currentYear && p.status === 'paid')
)

onMounted(async () => {
  if (route.query.success) toast.add({ severity:'success', summary:'Payment received!', detail:'Thank you for paying your HOA fee.', life:5000 })
  const { data } = await api.get('/payments')
  payments.value = data
  loading.value  = false
})

async function startCheckout() {
  payLoading.value = true
  try {
    const { data } = await api.post('/payments/checkout', { year: currentYear })
    window.location.href = data.checkout_url
  } catch (e) {
    toast.add({ severity:'error', summary:'Error', detail: e.response?.data?.message || 'Could not start checkout.', life: 4000 })
    payLoading.value = false
  }
}

async function openPortal() {
  const { data } = await api.get('/payments/portal')
  window.open(data.url, '_blank')
}

const statusSeverity = s => ({ paid:'success', pending:'warning', failed:'danger', refunded:'info' }[s] || 'secondary')
const fmtDate = d => new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })
</script>
