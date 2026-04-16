<template>
  <div class="min-h-screen flex flex-col">
    <PublicNav />
    <div class="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">
      <h1 class="text-3xl font-bold text-surface-900 mb-2">Frequently Asked Questions</h1>
      <p class="text-surface-500 mb-8">Everything you need to know about the Barnes Cove HOA.</p>

      <div v-if="loading" class="flex justify-center py-16">
        <ProgressSpinner />
      </div>

      <Accordion v-else-if="faqs.length" :multiple="true" class="flex flex-col gap-2">
        <AccordionTab v-for="faq in faqs" :key="faq.question" :header="faq.question">
          <p class="text-surface-600 leading-relaxed">{{ faq.answer }}</p>
        </AccordionTab>
      </Accordion>

      <div v-else class="text-center py-16 text-surface-400">
        <i class="pi pi-question-circle text-4xl mb-4 block" />
        <p>No FAQs published yet.</p>
      </div>

      <div class="mt-10 p-5 bg-primary-50 rounded-xl border border-primary-100 text-center">
        <p class="text-surface-700 font-medium mb-1">Still have questions?</p>
        <p class="text-surface-500 text-sm">
          Email us at
          <a href="mailto:admin@barnescove.com" class="text-primary-600 hover:underline">admin@barnescove.com</a>
        </p>
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
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import api from '@/api/axios'

const faqs    = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await api.get('/content/faq')
    faqs.value = data
  } catch {}
  finally { loading.value = false }
})
</script>
