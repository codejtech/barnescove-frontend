<template>
  <div class="min-h-screen flex items-center justify-center bg-surface-50 px-4">
    <Card class="w-full max-w-md shadow-lg">
      <template #header>
        <div class="text-center pt-6 pb-2">
          <img src="#" alt="Barnes Cove HOA" class="h-12 mx-auto mb-3" />
          <h1 class="text-2xl font-semibold text-surface-900">Resident Login</h1>
          <p class="text-surface-500 text-sm mt-1">Barnes Cove HOA Portal</p>
        </div>
      </template>
      <template #content>
        <form @submit.prevent="submit" class="flex flex-col gap-4 px-2 pb-4">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium">Email</label>
            <InputText v-model="form.email" type="email" placeholder="you@example.com"
              :class="{'p-invalid': errors.email}" required autofocus />
            <small class="p-error">{{ errors.email }}</small>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium">Password</label>
            <Password v-model="form.password" :feedback="false" toggleMask
              :class="{'p-invalid': errors.password}" required />
            <small class="p-error">{{ errors.password }}</small>
          </div>
          <div class="flex justify-end">
            <a href="/forgot-password" class="text-sm text-primary-600 hover:underline">Forgot password?</a>
          </div>
          <Button type="submit" label="Sign In" :loading="loading" class="w-full" />
          <Divider />
          <p class="text-center text-sm text-surface-500">
            Not registered?
            <RouterLink to="/register" class="text-primary-600 font-medium hover:underline">Request an account</RouterLink>
          </p>
        </form>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Divider from 'primevue/divider'

const auth    = useAuthStore()
const router  = useRouter()
const toast   = useToast()
const loading = ref(false)
const form    = reactive({ email: '', password: '' })
const errors  = reactive({ email: '', password: '' })

async function submit() {
  loading.value = true
  Object.keys(errors).forEach(k => errors[k] = '')
  try {
    const user = await auth.login(form.email, form.password)
    router.push(user.role === 'admin' ? '/admin' : '/dashboard')
  } catch (e) {
    const status = e.response?.status
    const msg    = e.response?.data?.message || 'Login failed.'
    if (status === 403 && e.response?.data?.status === 'pending') {
      router.push('/pending')
    } else {
      toast.add({ severity: 'error', summary: 'Login failed', detail: msg, life: 4000 })
    }
  } finally {
    loading.value = false
  }
}
</script>
