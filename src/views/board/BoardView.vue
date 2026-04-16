<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h2 class="text-2xl font-semibold mb-1">Neighborhood Board</h2>
    <p class="text-surface-500 mb-4">Announcements and updates from the HOA</p>

    <!-- Category filter -->
    <div class="flex gap-2 flex-wrap mb-6">
      <Button v-for="c in categories" :key="c.value"
        :label="c.label" :severity="activeCategory === c.value ? 'primary' : 'secondary'"
        size="small" rounded @click="setCategory(c.value)" />
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <ProgressSpinner />
    </div>

    <div v-else class="flex flex-col gap-4">
      <Card v-for="post in posts" :key="post.id"
        class="cursor-pointer hover:shadow-md transition-shadow"
        @click="$router.push('/board/'+post.id)">
        <template #content>
          <div class="flex items-start gap-3">
            <i v-if="post.pinned" class="pi pi-bookmark-fill text-amber-500 mt-1 shrink-0" />
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <Tag :severity="catSeverity(post.category)" :value="post.category.replace('_',' ')" />
                <span class="text-surface-400 text-xs">{{ fmtDate(post.published_at) }}</span>
              </div>
              <h3 class="font-semibold text-surface-900">{{ post.title }}</h3>
              <p class="text-surface-600 text-sm mt-1 line-clamp-2">{{ post.body }}</p>
              <p class="text-surface-400 text-xs mt-2">
                Posted by {{ post.author.first_name }} {{ post.author.last_name }}
              </p>
            </div>
          </div>
        </template>
      </Card>

      <div v-if="posts.length === 0" class="text-center py-12 text-surface-400">
        No announcements yet.
      </div>
    </div>

    <!-- Pagination -->
    <Paginator v-if="totalRecords > 20" :rows="20" :totalRecords="totalRecords"
      @page="onPage" class="mt-6" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Paginator from 'primevue/paginator'
import ProgressSpinner from 'primevue/progressspinner'

const posts          = ref([])
const loading        = ref(true)
const totalRecords   = ref(0)
const activeCategory = ref('')
const page           = ref(1)

const categories = [
  { label:'All', value:'' },
  { label:'General', value:'general' },
  { label:'Meetings', value:'meeting' },
  { label:'Road alerts', value:'road_alert' },
  { label:'Weather', value:'weather' },
  { label:'Events', value:'event' },
  { label:'Urgent', value:'urgent' },
]

async function loadPosts() {
  loading.value = true
  const params = { page: page.value }
  if (activeCategory.value) params.category = activeCategory.value
  const { data } = await api.get('/posts', { params })
  posts.value      = data.data
  totalRecords.value = data.total
  loading.value    = false
}

function setCategory(c) { activeCategory.value = c; page.value = 1; loadPosts() }
function onPage(e)       { page.value = e.page + 1; loadPosts() }

onMounted(loadPosts)

const catSeverity = c => ({ urgent:'danger', meeting:'info', road_alert:'warning',
  weather:'warning', event:'success', general:'secondary', maintenance:'secondary' }[c] || 'secondary')
const fmtDate = d => new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})
</script>
