<template>
  <div class="min-h-screen bg-surface-50 flex items-center justify-center px-4 py-10">
    <Card class="w-full max-w-lg shadow-lg">
      <template #header>
        <div class="text-center pt-6 pb-2">
          <h1 class="text-2xl font-semibold text-surface-900">Create Resident Account</h1>
          <p class="text-surface-500 text-sm mt-1">Barnes Cove HOA — Accounts require admin approval</p>
        </div>
      </template>
      <template #content>
        <form @submit.prevent="submit" class="grid grid-cols-2 gap-4 px-2 pb-4">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium">First name</label>
            <InputText v-model="form.first_name" :class="{'p-invalid':errors.first_name}" required />
            <small class="p-error">{{ errors.first_name?.[0] }}</small>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium">Last name</label>
            <InputText v-model="form.last_name" :class="{'p-invalid':errors.last_name}" required />
            <small class="p-error">{{ errors.last_name?.[0] }}</small>
          </div>
          <div class="flex flex-col gap-1 col-span-2">
            <label class="text-sm font-medium">Email</label>
            <InputText v-model="form.email" type="email" :class="{'p-invalid':errors.email}" required />
            <small class="p-error">{{ errors.email?.[0] }}</small>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium">Password</label>
            <Password v-model="form.password" toggleMask :class="{'p-invalid':errors.password}" required />
            <small class="p-error">{{ errors.password?.[0] }}</small>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium">Confirm password</label>
            <Password v-model="form.password_confirmation" :feedback="false" toggleMask required />
          </div>
          <div class="flex flex-col gap-1 col-span-2">
            <label class="text-sm font-medium">Street address</label>
            <InputText v-model="form.street_address" placeholder="123 Cove Drive"
              :class="{'p-invalid':errors.street_address}" required />
            <small class="p-error">{{ errors.street_address?.[0] }}</small>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium">ZIP code</label>
            <InputText v-model="form.zip" maxlength="10" :class="{'p-invalid':errors.zip}" required />
            <small class="p-error">{{ errors.zip?.[0] }}</small>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium">Lot number <span class="text-surface-400">(optional)</span></label>
            <InputText v-model="form.lot_number" maxlength="20" />
          </div>
          <div class="flex flex-col gap-1 col-span-2">
            <label class="text-sm font-medium">Phone <span class="text-surface-400">(optional)</span></label>
            <InputText v-model="form.phone" type="tel" />
          </div>
          <div class="col-span-2">
            <Button type="submit" label="Submit Application" :loading="loading" class="w-full" />
          </div>
          <p class="col-span-2 text-center text-sm text-surface-500">
            Already have an account?
            <RouterLink to="/login" class="text-primary-600 font-medium hover:underline">Sign in</RouterLink>
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
import api from '@/api/axios'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'

const router  = useRouter()
const toast   = useToast()
const loading = ref(false)
const errors  = ref({})
const form    = reactive({
  first_name:'', last_name:'', email:'', password:'', password_confirmation:'',
  street_address:'', zip:'', lot_number:'', phone:''
})

async function submit() {
  loading.value = true
  errors.value  = {}
  try {
    await api.post('/register', form)
    router.push('/pending')
  } catch (e) {
    if (e.response?.status === 422) {
      errors.value = e.response.data.errors
    } else {
      toast.add({ severity:'error', summary:'Error', detail:'Registration failed. Please try again.', life:4000 })
    }
  } finally { loading.value = false }
}
</script>
