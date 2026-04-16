<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h2 class="text-2xl font-semibold mb-1">My Account</h2>
    <p class="text-surface-500 mb-6">Update your contact information.</p>

    <div class="bg-surface-0 border border-surface-200 rounded-xl p-6 flex flex-col gap-5">
      <!-- Read-only fields -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="text-xs font-medium text-surface-400 uppercase tracking-wide">Address</label>
          <p class="text-surface-900 mt-1">{{ auth.user?.street_address }}</p>
        </div>
        <div>
          <label class="text-xs font-medium text-surface-400 uppercase tracking-wide">Status</label>
          <div class="mt-1">
            <Tag value="Active Resident" severity="success" />
          </div>
        </div>
        <div>
          <label class="text-xs font-medium text-surface-400 uppercase tracking-wide">Email</label>
          <p class="text-surface-900 mt-1">{{ auth.user?.email }}</p>
        </div>
        <div>
          <label class="text-xs font-medium text-surface-400 uppercase tracking-wide">Lot number</label>
          <p class="text-surface-900 mt-1">{{ auth.user?.lot_number || '—' }}</p>
        </div>
      </div>

      <Divider />

      <!-- Editable fields -->
      <form @submit.prevent="save" class="flex flex-col gap-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium">First name</label>
            <InputText v-model="form.first_name" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium">Last name</label>
            <InputText v-model="form.last_name" />
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium">Phone</label>
          <InputText v-model="form.phone" type="tel" placeholder="+1 (555) 000-0000" />
        </div>
        <div class="flex justify-end">
          <Button type="submit" label="Save changes" :loading="saving" />
        </div>
      </form>

      <Divider />

      <!-- Password change -->
      <div>
        <h3 class="font-semibold text-surface-900 mb-3">Change Password</h3>
        <form @submit.prevent="changePassword" class="flex flex-col gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium">New password</label>
            <Password v-model="pwForm.password" toggleMask />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium">Confirm new password</label>
            <Password v-model="pwForm.password_confirmation" :feedback="false" toggleMask />
          </div>
          <div class="flex justify-end">
            <Button type="submit" label="Update password" severity="secondary" :loading="pwSaving" />
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useToast } from 'primevue/usetoast'
import api from '@/api/axios'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Divider from 'primevue/divider'
import Tag from 'primevue/tag'

const auth  = useAuthStore()
const toast = useToast()

const form   = reactive({ first_name: auth.user?.first_name, last_name: auth.user?.last_name, phone: auth.user?.phone || '' })
const pwForm = reactive({ password: '', password_confirmation: '' })
const saving   = ref(false)
const pwSaving = ref(false)

async function save() {
  saving.value = true
  try {
    await auth.fetchMe()
    await api.put('/me', form)
    await auth.fetchMe()
    toast.add({ severity:'success', summary:'Saved', detail:'Profile updated.', life:3000 })
  } finally { saving.value = false }
}

async function changePassword() {
  if (pwForm.password !== pwForm.password_confirmation) {
    toast.add({ severity:'error', summary:'Mismatch', detail:"Passwords don't match.", life:3000 })
    return
  }
  pwSaving.value = true
  try {
    await api.put('/me/password', pwForm)
    toast.add({ severity:'success', summary:'Updated', detail:'Password changed successfully.', life:3000 })
    pwForm.password = ''
    pwForm.password_confirmation = ''
  } catch {
    toast.add({ severity:'error', summary:'Error', detail:'Could not update password.', life:3000 })
  } finally { pwSaving.value = false }
}
</script>
