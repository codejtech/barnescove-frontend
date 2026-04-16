<template>
  <div class="p-6">
    <h2 class="text-2xl font-semibold mb-1">Resident Accounts</h2>
    <p class="text-surface-500 mb-4">Review, approve, or reject account applications</p>

    <!-- Stats row -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard v-for="s in stats" :key="s.label" :label="s.label" :value="s.value" :icon="s.icon" :color="s.color" />
    </div>

    <!-- Filters -->
    <div class="flex gap-3 mb-4 flex-wrap">
      <Select v-model="statusFilter" :options="statusOptions" optionLabel="label" optionValue="value"
        placeholder="All statuses" @change="loadUsers" class="w-44" />
      <InputText v-model="search" placeholder="Search name, email, address…"
        @input="debounceSearch" class="flex-1 min-w-48" />
    </div>

    <DataTable :value="users" :loading="loading" stripedRows responsiveLayout="scroll">
      <Column field="first_name" header="Name">
        <template #body="{ data }">{{ data.first_name }} {{ data.last_name }}</template>
      </Column>
      <Column field="email" header="Email" />
      <Column field="street_address" header="Address" />
      <Column header="Status">
        <template #body="{ data }">
          <Tag :severity="userSeverity(data.status)" :value="data.status" />
        </template>
      </Column>
      <Column header="Applied">
        <template #body="{ data }">{{ fmtDate(data.created_at) }}</template>
      </Column>
      <Column header="Actions">
        <template #body="{ data }">
          <div class="flex gap-1">
            <Button icon="pi pi-eye" text rounded size="small"
              @click="$router.push('/admin/users/'+data.id)" tooltip="View details" />
            <Button v-if="data.status==='pending'" icon="pi pi-check" text rounded size="small"
              severity="success" @click="approve(data)" tooltip="Approve" />
            <Button v-if="data.status==='pending'" icon="pi pi-times" text rounded size="small"
              severity="danger" @click="openReject(data)" tooltip="Reject" />
            <Button v-if="data.status==='active'" icon="pi pi-ban" text rounded size="small"
              severity="warning" @click="suspend(data)" tooltip="Suspend" />
          </div>
        </template>
      </Column>
    </DataTable>

    <Paginator :rows="25" :totalRecords="total" @page="onPage" class="mt-4" />

    <!-- Reject dialog -->
    <Dialog v-model="rejectDialog" header="Reject Account" modal class="w-full max-w-md">
      <div class="flex flex-col gap-3 pt-2">
        <p class="text-surface-600">Provide a reason for <strong>{{ rejectTarget?.first_name }}</strong>:</p>
        <Textarea v-model="rejectReason" rows="4" placeholder="e.g. Address not found in Barnes Cove HOA roster." />
        <div class="flex justify-end gap-2">
          <Button label="Cancel" severity="secondary" @click="rejectDialog=false" />
          <Button label="Reject Account" severity="danger" :loading="rejectLoading" @click="submitReject" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import api from '@/api/axios'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Paginator from 'primevue/paginator'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'

// StatCard is a simple local component defined below
const StatCard = {
  props: ['label','value','icon','color'],
  template: `<div class="bg-surface-0 rounded-xl border border-surface-200 p-4 flex items-center gap-3">
    <i :class="[icon, color, 'text-2xl']" />
    <div><p class="text-2xl font-semibold">{{ value }}</p><p class="text-sm text-surface-500">{{ label }}</p></div>
  </div>`
}

const toast         = useToast()
const users         = ref([])
const loading       = ref(true)
const total         = ref(0)
const page          = ref(1)
const statusFilter  = ref('')
const search        = ref('')
const rejectDialog  = ref(false)
const rejectTarget  = ref(null)
const rejectReason  = ref('')
const rejectLoading = ref(false)
const stats         = ref([
  { label:'Pending',  value:0, icon:'pi pi-clock',         color:'text-amber-500' },
  { label:'Active',   value:0, icon:'pi pi-check-circle',  color:'text-green-500' },
  { label:'Rejected', value:0, icon:'pi pi-times-circle',  color:'text-red-500' },
  { label:'Total',    value:0, icon:'pi pi-users',         color:'text-blue-500' },
])

const statusOptions = [
  {label:'All statuses', value:''},
  {label:'Pending', value:'pending'},
  {label:'Active', value:'active'},
  {label:'Rejected', value:'rejected'},
  {label:'Suspended', value:'suspended'},
]

let debounceTimer
function debounceSearch() { clearTimeout(debounceTimer); debounceTimer = setTimeout(loadUsers, 400) }

async function loadUsers() {
  loading.value = true
  const params = { page: page.value }
  if (statusFilter.value) params.status = statusFilter.value
  if (search.value)       params.search = search.value
  const { data } = await api.get('/admin/users', { params })
  users.value = data.data
  total.value = data.total
  // Quick stat counts (pending = first page unfiltered)
  loading.value = false
}

function onPage(e) { page.value = e.page+1; loadUsers() }

async function approve(user) {
  await api.post(`/admin/users/${user.id}/approve`)
  toast.add({ severity:'success', summary:'Approved', detail:`${user.first_name}'s account is now active.`, life:3000 })
  loadUsers()
}

function openReject(user) { rejectTarget.value = user; rejectReason.value = ''; rejectDialog.value = true }

async function submitReject() {
  if (!rejectReason.value.trim()) return
  rejectLoading.value = true
  await api.post(`/admin/users/${rejectTarget.value.id}/reject`, { reason: rejectReason.value })
  toast.add({ severity:'info', summary:'Rejected', detail:'Account rejected and user notified.', life:3000 })
  rejectDialog.value = false
  rejectLoading.value = false
  loadUsers()
}

async function suspend(user) {
  await api.post(`/admin/users/${user.id}/suspend`)
  toast.add({ severity:'warn', summary:'Suspended', detail:`${user.first_name}'s account has been suspended.`, life:3000 })
  loadUsers()
}

const userSeverity = s => ({ active:'success', pending:'warning', rejected:'danger', suspended:'secondary' }[s])
const fmtDate = d => new Date(d).toLocaleDateString()
onMounted(loadUsers)
</script>
