<template>
  <div class="bg-surface-0 border border-surface-200 rounded-xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
    <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', color]">
      <i :class="[icon, 'text-xl']" />
    </div>
    <div>
      <h3 class="font-semibold text-surface-900 mb-1">{{ title }}</h3>
      <p class="text-sm text-surface-500 leading-relaxed">{{ desc }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon:  String,
  title: String,
  desc:  String,
  color: String,
})
</script>
