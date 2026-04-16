<template>
  <div class="min-h-screen flex items-center justify-center bg-surface-50 px-4">
    <Card class="w-full max-w-md text-center shadow-lg">
      <template #content>
        <div class="py-8 flex flex-col items-center gap-4">
          <i class="pi pi-clock text-5xl text-amber-500" />
          <h2 class="text-2xl font-semibold">Application Pending</h2>
          <p class="text-surface-500 max-w-sm">
            Your account is being reviewed by the Barnes Cove HOA administrator.
            You'll receive an email at <strong>{{ auth.user?.email }}</strong> once approved.
          </p>
          <p class="text-surface-400 text-sm">Questions? Contact <a href="mailto:admin@barnescove.com" class="text-primary-600">admin@barnescove.com</a></p>
          <Button label="Back to Home" severity="secondary" @click="$router.push('/')" />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import Card from 'primevue/card'
import Button from 'primevue/button'
const auth = useAuthStore()
</script>
