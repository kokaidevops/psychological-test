<template>
  <section class="py-12">
    <div class="flex items-end justify-between flex-wrap gap-5 mb-10">
      <div>
        <div class="text-[10px] uppercase tracking-[0.2em] text-muted mb-2">Mode Tampilan</div>
        <h2 class="font-display text-3xl lg:text-4xl font-light">Pilih cara Anda mengerjakan</h2>
        <p class="text-muted text-sm mt-2 max-w-md">Beralih antara tampilan ringkas semua soal atau fokus pada satu soal dalam satu waktu.</p>
      </div>
      
      <div class="inline-flex p-1 bg-card border border-border rounded-full shadow-sm">
        <button 
          @click="store.setMode(1)" 
          :class="store.mode === 1 ? 'bg-fg text-bg' : 'text-muted'"
          class="px-5 py-2.5 rounded-full text-sm font-medium transition-all"
        >
          <span class="inline-flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            Semua Soal
          </span>
        </button>
        <button 
          @click="store.setMode(2)" 
          :class="store.mode === 2 ? 'bg-fg text-bg' : 'text-muted'"
          class="px-5 py-2.5 rounded-full text-sm font-medium transition-all"
        >
          <span class="inline-flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/></svg>
            Satu Soal
          </span>
        </button>
      </div>
    </div>
    
    <!-- MODE 1: SEMUA SOAL -->
    <div :class="['mode-content', store.mode === 1 && 'active']">
      <div class="mb-6 flex items-center justify-between flex-wrap gap-3 text-sm">
        <div class="text-muted">Gulir untuk melihat seluruh pernyataan. Jawaban tersimpan otomatis.</div>
      </div>
      <div class="grid md:grid-cols-2 gap-5">
        <QuestionCard 
          v-for="(q, index) in store.questions" 
          :key="q.id" 
          :question="q" 
          :index="index"
        />
      </div>
    </div>
    
    <!-- MODE 2: SATU SOAL -->
    <div :class="['mode-content', store.mode === 2 && 'active']">
      <SingleQuestionView />
    </div>
  </section>
</template>

<script setup>
import { useAssessmentStore } from '../stores/assessment'
import QuestionCard from './QuestionCard.vue'
import SingleQuestionView from './SingleQuestionView.vue'

const store = useAssessmentStore()
</script>