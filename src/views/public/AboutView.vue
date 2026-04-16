<template>
  <div class="min-h-screen flex flex-col">
    <PublicNav />
    <div class="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">
      <h1 class="text-3xl font-bold text-surface-900 mb-2">About Barnes Cove HOA</h1>
      <p class="text-surface-500 mb-8">Our neighborhood, our community.</p>

      <div class="flex flex-col gap-8">
        <section>
          <h2 class="text-xl font-semibold text-surface-800 mb-3">Our Mission</h2>
          <p class="text-surface-600 leading-relaxed">
            The Barnes Cove Homeowners Association exists to maintain and enhance the quality of life,
            property values, and community spirit of our neighborhood. We are a volunteer-led organization
            committed to fair, transparent governance.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-surface-800 mb-3">The Board</h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div v-for="m in board" :key="m.name"
              class="bg-surface-50 border border-surface-200 rounded-xl p-4 text-center">
              <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-3">
                <i class="pi pi-user text-primary-600 text-xl" />
              </div>
              <p class="font-semibold text-surface-900">{{ m.name }}</p>
              <p class="text-sm text-surface-400">{{ m.role }}</p>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-surface-800 mb-3">Contact Us</h2>
          <p class="text-surface-600">
            Questions or concerns? Email us at
            <a href="mailto:admin@barnescove.com" class="text-primary-600 hover:underline">
              admin@barnescove.com
            </a>
          </p>
        </section>
      </div>
    </div>
    <PublicFooter />
  </div>
</template>

<script setup>
import PublicNav from '@/components/PublicNav.vue'
import PublicFooter from '@/components/PublicFooter.vue'

const board = [
  { name: 'Jane Smith',    role: 'President' },
  { name: 'Tom Williams',  role: 'Treasurer' },
  { name: 'Sara Johnson',  role: 'Secretary' },
]
</script>
