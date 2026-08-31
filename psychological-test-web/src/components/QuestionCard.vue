<template>
  <article 
    :class="[
      'bg-card border border-border rounded-2xl p-7 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-20px_rgba(26,24,22,0.15)] hover:border-fg',
      isAnswered && 'bg-linear-to-b from-white to-[#FCFAF5]'
    ]"
  >
    <div class="flex items-start justify-between mb-5">
      <span class="text-xs text-muted section-num">Pernyataan {{ String(index + 1).padStart(2, '0') }}</span>
      <div class="flex items-center gap-2">
        <span v-if="isAnswered" class="w-1.5 h-1.5 rounded-full bg-accent"></span>
        <span v-if="isAnswered" class="text-[10px] uppercase tracking-wider text-accent font-medium">Terjawab</span>
        <span v-else class="text-[10px] uppercase tracking-wider text-muted">Belum dijawab</span>
      </div>
    </div>
    
    <p class="font-display text-lg lg:text-xl leading-snug mb-7">
      {{ question.text }}
    </p>
    
    <div class="space-y-1">
      <div class="flex justify-between text-[10px] text-muted mb-2 px-1">
        <span>Sangat tidak setuju</span>
        <span>Sangat setuju</span>
      </div>
      <div class="grid grid-cols-5 gap-1.5">
        <button 
          v-for="val in 5" 
          :key="val"
          @click="store.setAnswer(question.id, val)"
          :class="[
            'likert-btn py-2 rounded-lg flex flex-col items-center gap-1.5 border border-transparent transition-all',
            store.answers[question.id] === val && 'bg-accent/5'
          ]"
        >
          <span :class="[
            'dot w-4 h-4 rounded-full border-[1.5px] border-border relative transition-all',
            store.answers[question.id] === val && 'bg-accent border-accent scale-110'
          ]">
            <span v-if="store.answers[question.id] === val" class="absolute inset-1 bg-white rounded-full"></span>
          </span>
          <span :class="[
            'num text-[10px] transition-colors',
            store.answers[question.id] === val ? 'text-accent font-semibold' : 'text-muted'
          ]">{{ val }}</span>
        </button>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { useAssessmentStore } from '../stores/assessment'

const props = defineProps({
  question: Object,
  index: Number
})

const store = useAssessmentStore()
const isAnswered = computed(() => store.answers[props.question.id] !== undefined)
</script>