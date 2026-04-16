<template>
  <div class="p-6 max-w-4xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-semibold">Neighborhood Announcements</h2>
        <p class="text-surface-500 text-sm">Create and publish posts to the message board</p>
      </div>
      <Button label="New Post" icon="pi pi-plus" @click="openNew" />
    </div>

    <DataTable :value="posts" :loading="loading" stripedRows>
      <Column field="title" header="Title" />
      <Column header="Category">
        <template #body="{ data }">
          <Tag :severity="catSeverity(data.category)" :value="data.category.replace('_',' ')" />
        </template>
      </Column>
      <Column header="Status">
        <template #body="{ data }">
          <Tag :severity="data.published_at ? 'success' : 'secondary'"
            :value="data.published_at ? 'published' : 'draft'" />
        </template>
      </Column>
      <Column header="Email blast">
        <template #body="{ data }">
          <i :class="data.email_sent ? 'pi pi-check text-green-500' : (data.send_email ? 'pi pi-clock text-amber-500' : 'pi pi-minus text-surface-300')" />
        </template>
      </Column>
      <Column header="Actions">
        <template #body="{ data }">
          <div class="flex gap-1">
            <Button icon="pi pi-pencil" text rounded size="small" @click="openEdit(data)" />
            <Button v-if="!data.published_at" icon="pi pi-send" text rounded size="small"
              severity="success" @click="publish(data)" tooltip="Publish" />
            <Button icon="pi pi-trash" text rounded size="small"
              severity="danger" @click="deletePost(data)" />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Create / edit dialog -->
    <Dialog v-model="showDialog" :header="editing ? 'Edit Post' : 'New Announcement'" modal
      class="w-full max-w-2xl" :draggable="false">
      <form @submit.prevent="savePost" class="flex flex-col gap-4 pt-2">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium">Title</label>
          <InputText v-model="form.title" required maxlength="200" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium">Category</label>
            <Select v-model="form.category" :options="catOptions" optionLabel="label" optionValue="value" required />
          </div>
          <div class="flex items-center gap-3 pt-5">
            <Checkbox v-model="form.pinned" :binary="true" inputId="pinned" />
            <label for="pinned" class="text-sm">Pin to top of board</label>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium">Message body</label>
          <Textarea v-model="form.body" rows="8" required />
        </div>
        <div class="flex items-center gap-3">
          <Checkbox v-model="form.send_email" :binary="true" inputId="sendEmail" />
          <label for="sendEmail" class="text-sm">
            Email blast to all active residents on publish
            <span class="text-surface-400">(uses SendGrid queue)</span>
          </label>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <Button label="Save as draft" severity="secondary" type="submit" :loading="saving" />
          <Button v-if="editing && !form.published_at" label="Save &amp; publish" @click="saveAndPublish" :loading="saving" />
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
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'

const toast      = useToast()
const posts      = ref([])
const loading    = ref(true)
const showDialog = ref(false)
const editing    = ref(null)  // post id when editing
const saving     = ref(false)
const blank      = () => ({ title:'', category:'general', body:'', pinned:false, send_email:false })
const form       = ref(blank())

const catOptions = [
  {label:'General',    value:'general'},
  {label:'Meeting',    value:'meeting'},
  {label:'Road alert', value:'road_alert'},
  {label:'Weather',    value:'weather'},
  {label:'Maintenance',value:'maintenance'},
  {label:'Event',      value:'event'},
  {label:'Urgent',     value:'urgent'},
]

onMounted(async () => {
  const { data } = await api.get('/admin/posts')
  posts.value  = data.data
  loading.value= false
})

function openNew()    { editing.value = null; form.value = blank(); showDialog.value = true }
function openEdit(p)  { editing.value = p.id; form.value = { ...p }; showDialog.value = true }

async function savePost() {
  saving.value = true
  try {
    if (editing.value) await api.put(`/admin/posts/${editing.value}`, form.value)
    else               await api.post('/admin/posts', form.value)
    toast.add({ severity:'success', summary:'Saved', life:3000 })
    showDialog.value = false
    const { data } = await api.get('/admin/posts')
    posts.value = data.data
  } finally { saving.value = false }
}

async function saveAndPublish() {
  await savePost()
  await publish({ id: editing.value })
}

async function publish(post) {
  await api.post(`/admin/posts/${post.id}/publish`)
  toast.add({ severity:'success', summary:'Published', detail:'Post is now live on the board.', life:3000 })
  const { data } = await api.get('/admin/posts')
  posts.value = data.data
}

async function deletePost(post) {
  await api.delete(`/admin/posts/${post.id}`)
  posts.value = posts.value.filter(p => p.id !== post.id)
  toast.add({ severity:'info', summary:'Deleted', life:2000 })
}

const catSeverity = c => ({ urgent:'danger', meeting:'info', road_alert:'warning',
  event:'success', weather:'warning' }[c] || 'secondary')
</script>
