<template>
  <div class="border-b border-border">
    <button 
      @click="guideStore.toggleFaq(faq.id)"
      class="w-full flex items-center justify-between py-5 text-left gap-4"
    >
      <span class="font-display text-lg leading-snug">{{ faq.q }}</span>
      <span 
        :class="[
          'shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all',
          guideStore.openFaq === faq.id ? 'bg-fg text-bg border-fg rotate-180' : 'border-border text-muted'
        ]"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path v-if="guideStore.openFaq === faq.id" d="M12 5v14M5 12h14" />
          <path v-else d="M12 5v14" />
        </svg>
      </span>
    </button>
    <transition name="faq">
      <div v-if="guideStore.openFaq === faq.id" class="overflow-hidden">
        <p class="text-muted leading-relaxed pb-5 pr-12">
          {{ faq.a }}
        </p>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { useGuideStore } from '../../stores/guide'

defineProps({
  faq: Object
})

const guideStore = useGuideStore()
</script>

<style scoped>
.faq-enter-active,
.faq-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
}
.faq-enter-from,
.faq-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}
</style>