<template>
  <footer class="bg-surface-900 text-surface-400 py-10 px-6 mt-auto">
    <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Brand -->
      <div>
        <div class="flex items-center gap-2 mb-3">
          <div class="w-7 h-7 rounded-md bg-primary-600 flex items-center justify-center">
            <i class="pi pi-home text-white text-xs" />
          </div>
          <span class="text-white font-semibold text-sm">Barnes Cove HOA</span>
        </div>
        <p class="text-xs leading-relaxed">
          Your neighborhood portal for payments, requests, and community updates.
        </p>
      </div>

      <!-- Links -->
      <div>
        <p class="text-white text-sm font-medium mb-3">Quick Links</p>
        <div class="flex flex-col gap-2">
          <RouterLink v-for="link in footerLinks" :key="link.to" :to="link.to"
            class="text-xs text-surface-400 hover:text-white transition-colors no-underline">
            {{ link.label }}
          </RouterLink>
        </div>
      </div>

      <!-- Contact -->
      <div>
        <p class="text-white text-sm font-medium mb-3">Contact</p>
        <div class="flex flex-col gap-2 text-xs">
          <a href="mailto:admin@barnescove.com"
            class="flex items-center gap-2 text-surface-400 hover:text-white transition-colors">
            <i class="pi pi-envelope" />
            admin@barnescove.com
          </a>
          <p class="flex items-center gap-2">
            <i class="pi pi-map-marker" />
            Barnes Cove, TN
          </p>
        </div>
      </div>
    </div>

    <div class="max-w-6xl mx-auto border-t border-surface-700 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
      <p class="text-xs">© {{ year }} Barnes Cove HOA. All rights reserved.</p>
      <div class="flex gap-4 text-xs">
        <RouterLink to="/rules" class="text-surface-400 hover:text-white no-underline">HOA Rules</RouterLink>
        <RouterLink to="/faq"   class="text-surface-400 hover:text-white no-underline">FAQ</RouterLink>
      </div>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()

const footerLinks = [
  { to: '/',        label: 'Home' },
  { to: '/about',   label: 'About' },
  { to: '/rules',   label: 'HOA Rules' },
  { to: '/faq',     label: 'FAQ' },
  { to: '/login',   label: 'Resident Login' },
  { to: '/register',label: 'Register' },
]
</script>
