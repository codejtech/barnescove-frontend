<template>
  <div class="min-h-screen flex flex-col">

    <!-- ── Nav ─────────────────────────────────────────────── -->
    <PublicNav />

    <!-- ── Hero ────────────────────────────────────────────── -->
    <section class="bg-gradient-to-br from-primary-700 to-primary-900 text-white py-24 px-6 text-center">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-4xl md:text-5xl font-bold mb-4 leading-tight">
          {{ content.heroTitle || 'Welcome to Barnes Cove' }}
        </h1>
        <p class="text-primary-100 text-lg mb-8">
          {{ content.heroSubtitle || 'Your neighborhood portal for HOA payments, updates, and community.' }}
        </p>
        <div class="flex gap-3 justify-center flex-wrap">
          <RouterLink to="/register">
            <Button label="Create Resident Account" icon="pi pi-user-plus" size="large"
              class="bg-white !text-primary-700 hover:bg-primary-50 border-0" />
          </RouterLink>
          <RouterLink to="/login">
            <Button label="Sign In" icon="pi pi-sign-in" size="large" outlined
              class="!text-white !border-white hover:!bg-white/10" />
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- ── Feature cards ───────────────────────────────────── -->
    <section class="py-16 px-6 bg-surface-50">
      <div class="max-w-5xl mx-auto">
        <h2 class="text-2xl font-semibold text-center text-surface-900 mb-10">Everything you need as a resident</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard v-for="f in features" :key="f.title"
            :icon="f.icon" :title="f.title" :desc="f.desc" :color="f.color" />
        </div>
      </div>
    </section>

    <!-- ── Intro body from Contentful ──────────────────────── -->
    <section v-if="content.introBody" class="py-12 px-6 bg-surface-0">
      <div class="max-w-3xl mx-auto prose prose-surface">
        <p class="text-surface-600 text-lg leading-relaxed">{{ content.introBody }}</p>
      </div>
    </section>

    <!-- ── CTA ─────────────────────────────────────────────── -->
    <section class="py-16 px-6 bg-primary-50 text-center">
      <h2 class="text-2xl font-semibold text-surface-900 mb-3">Ready to get started?</h2>
      <p class="text-surface-500 mb-6">Create your account and get approved in minutes.</p>
      <RouterLink to="/register">
        <Button label="Register Now" icon="pi pi-arrow-right" iconPos="right" />
      </RouterLink>
    </section>

    <PublicFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Button from 'primevue/button'
import PublicNav from '@/components/PublicNav.vue'
import PublicFooter from '@/components/PublicFooter.vue'
import FeatureCard from '@/components/FeatureCard.vue'
import api from '@/api/axios'

const content = ref({ heroTitle: '', heroSubtitle: '', introBody: '' })

const features = [
  { icon: 'pi pi-credit-card', title: 'Pay HOA Fees',      desc: 'Securely pay your annual dues online via Stripe.',          color: 'text-blue-600 bg-blue-50' },
  { icon: 'pi pi-file-edit',   title: 'Change Requests',   desc: 'Submit curb appeal, lawn, or home addition requests.',      color: 'text-green-600 bg-green-50' },
  { icon: 'pi pi-comments',    title: 'Message Board',     desc: 'Stay informed with HOA meetings and neighborhood alerts.',   color: 'text-amber-600 bg-amber-50' },
  { icon: 'pi pi-shield',      title: 'Safe Community',    desc: 'Admin-verified accounts keep the community trusted.',        color: 'text-purple-600 bg-purple-50' },
]

onMounted(async () => {
  try {
    // Content served from Laravel's cached Contentful proxy
    const { data } = await api.get('/content/home')
    content.value = data
  } catch {
    // Falls back to static strings in the template
  }
})
</script>
