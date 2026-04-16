<template>
  <div class="p-6 max-w-2xl mx-auto">
    <Button icon="pi pi-arrow-left" label="Message board" text @click="$router.back()" class="mb-4" />

    <div v-if="loading" class="flex justify-center py-16"><ProgressSpinner /></div>

    <div v-else-if="post" class="bg-surface-0 border border-surface-200 rounded-xl p-6">
      <div class="flex items-center gap-2 mb-3">
        <Tag :severity="catSeverity(post.category)" :value="post.category.replace('_',' ')" />
        <span v-if="post.pinned" class="flex items-center gap-1 text-xs text-amber-600">
          <i class="pi pi-bookmark-fill" /> Pinned
        </span>
      </div>
      <h1 class="text-2xl font-bold text-surface-900 mb-2">{{ post.title }}</h1>
      <p class="text-xs text-surface-400 mb-6">
        Posted by {{ post.author?.first_name }} {{ post.author?.last_name }}
        · {{ fmtDate(post.published_at) }}
      </p>
      <div class="text-surface-700 leading-relaxed whitespace-pre-line">{{ post.body }}</div>
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
const post    = ref(null)
const loading = ref(true)

onMounted(async () => {
  const { data } = await api.get(`/posts/${route.params.id}`)
  post.value    = data
  loading.value = false
})

const catSeverity = c => ({ urgent:'danger', meeting:'info', road_alert:'warning',
  weather:'warning', event:'success' }[c] || 'secondary')
const fmtDate = d => new Date(d).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})
</script>
