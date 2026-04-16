<template>
  <div class="p-6 max-w-3xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-semibold">Change Requests</h2>
        <p class="text-surface-500 text-sm">Curb appeal, lawn, or home addition requests</p>
      </div>
      <Button label="New Request" icon="pi pi-plus" @click="showDialog = true" />
    </div>

    <DataTable :value="requests" :loading="loading" stripedRows>
      <Column field="title" header="Title" />
      <Column field="type" header="Type">
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
          <Button icon="pi pi-eye" text rounded @click="$router.push('/dashboard/requests/'+data.id)" />
        </template>
      </Column>
    </DataTable>

    <!-- New request dialog -->
    <Dialog v-model="showDialog" header="Submit Change Request" modal
      class="w-full max-w-xl" :draggable="false">
      <form @submit.prevent="submitRequest" class="flex flex-col gap-4 pt-2">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium">Request type</label>
          <Select v-model="form.type" :options="typeOptions" optionLabel="label" optionValue="value"
            placeholder="Select type" required />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium">Title</label>
          <InputText v-model="form.title" placeholder="Brief summary" required maxlength="200" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium">Description</label>
          <Textarea v-model="form.description" rows="5"
            placeholder="Describe the changes you'd like to make..." required />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium">Attachments <span class="text-surface-400">(photos, plans — optional)</span></label>
          <FileUpload mode="basic" :multiple="true" accept="image/*,.pdf"
            :maxFileSize="10000000" @select="files = $event.files" chooseLabel="Choose files" />
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <Button label="Cancel" severity="secondary" @click="showDialog = false" type="button" />
          <Button label="Submit Request" type="submit" :loading="submitting" />
        </div>
      </form>
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
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import FileUpload from 'primevue/fileupload'

const toast      = useToast()
const requests   = ref([])
const loading    = ref(true)
const showDialog = ref(false)
const submitting = ref(false)
const files      = ref([])
const form       = ref({ type:'', title:'', description:'' })

const typeOptions = [
  { label:'Curb appeal', value:'curb_appeal' },
  { label:'Lawn modification', value:'lawn' },
  { label:'Home addition / build', value:'home_addition' },
  { label:'Other', value:'other' },
]

onMounted(async () => {
  const { data } = await api.get('/change-requests')
  requests.value = data.data
  loading.value  = false
})

async function submitRequest() {
  submitting.value = true
  try {
    const fd = new FormData()
    Object.entries(form.value).forEach(([k,v]) => fd.append(k, v))
    files.value.forEach(f => fd.append('files[]', f))
    await api.post('/change-requests', fd, { headers:{'Content-Type':'multipart/form-data'} })
    toast.add({ severity:'success', summary:'Request submitted', detail:'The HOA board will review your request.', life:4000 })
    showDialog.value = false
    form.value = { type:'', title:'', description:'' }
    files.value = []
    const { data } = await api.get('/change-requests')
    requests.value = data.data
  } catch (e) {
    toast.add({ severity:'error', summary:'Error', detail:'Could not submit request.', life:4000 })
  } finally { submitting.value = false }
}

const typeLabel = t => typeOptions.find(o => o.value === t)?.label || t
const reqSeverity = s => ({ submitted:'info', under_review:'warning', approved:'success', rejected:'danger' }[s])
const fmtDate = d => new Date(d).toLocaleDateString()
</script>
