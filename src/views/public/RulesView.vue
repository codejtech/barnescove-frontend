<template>
  <div class="min-h-screen flex flex-col">
    <PublicNav />
    <div class="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">
      <h1 class="text-3xl font-bold text-surface-900 mb-2">HOA Rules & Guidelines</h1>
      <p class="text-surface-500 mb-8">Please review these rules to keep Barnes Cove a great place to live.</p>

      <div v-if="loading" class="flex justify-center py-16">
        <ProgressSpinner />
      </div>

      <div v-else-if="rules.length" class="flex flex-col gap-4">
        <div v-for="rule in rules" :key="rule.title"
          class="bg-surface-0 border border-surface-200 rounded-xl p-5">
          <div class="flex items-center gap-2 mb-2">
            <Tag :value="rule.category" severity="secondary" class="text-xs" />
          </div>
          <h3 class="font-semibold text-surface-900 mb-1">{{ rule.title }}</h3>
          <p class="text-surface-600 text-sm leading-relaxed">{{ rule.body }}</p>
        </div>
      </div>

      <!-- Fallback if Contentful has no entries yet -->
      <div v-else class="text-center py-16 text-surface-400">
        <i class="pi pi-book text-4xl mb-4 block" />
        <p>Rules and guidelines coming soon.</p>
        <p class="text-sm mt-1">Check back after the HOA board publishes them.</p>
      </div>
    </div>
    <PublicFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PublicNav from '@/components/PublicNav.vue'
import PublicFooter from '@/components/PublicFooter.vue'
import ProgressSpinner from 'primevue/progressspinner'
import Tag from 'primevue/tag'
import api from '@/api/axios'

const rules   = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await api.get('/content/rules')
    rules.value = data
  } catch {}
  finally { loading.value = false }
})
</script>
