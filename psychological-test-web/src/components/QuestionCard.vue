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
      {{ question.title }}
    </p>
    
    <div v-if="question.type === 'likert'" class="space-y-1">
      <div class="flex justify-between text-[10px] text-muted mb-2 px-1">
        <span>Sangat tidak setuju</span>
        <span>Sangat setuju</span>
      </div>
      <div class="grid grid-cols-5 gap-1.5">
        <!-- <button 
          v-for="val in 5" 
          :key="val"
          @click="store.saveDraftAnswers(question.id, val)"
          :class="[
            'py-2 rounded-lg flex flex-col items-center gap-1.5 border border-transparent transition-all',
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
        </button> -->
        <button 
          v-for="opt in question.answers" 
          :key="opt.answer_id"
          @click="store.saveDraftAnswers(question.id, opt.answer_id)"
          :class="[
            'py-2 rounded-lg flex flex-col items-center gap-1.5 border border-transparent transition-all',
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
          ]">{{ opt.name }}</span>
        </button>

        <div class="save-status" v-if="store.isSaving">
          <span class="spinner"></span> Menyimpan jawaban...
        </div>
        <div class="save-status offline" v-else-if="store.isOffline">
          ⚠️ Koneksi terputus, jawaban tersimpan secara lokal
        </div>
        <div class="save-status saved" v-else>
          ✅ Tersimpan
        </div>
      </div>
    </div>

    <div v-else-if="question.type === 'multiple'" class="space-y-2">
      <button 
        v-for="opt in question.answers" 
        :key="opt.answer_id"
        @click="store.saveDraftAnswers(question.id, opt.answer_id)"
        :class="[
          'w-full text-left p-3.5 rounded-xl border flex items-center gap-3 transition-all',
          store.answers[question.id] === opt.answer_id 
            ? 'border-accent bg-accent/5 text-fg' 
            : 'border-border text-muted hover:border-fg hover:bg-subtle'
        ]"
      >
        <span :class="[
          'w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all',
          store.answers[question.id] === opt.answer_id ? 'border-accent bg-accent' : 'border-border'
        ]">
          <span v-if="store.answers[question.id] === opt.answer_id" class="w-2 h-2 bg-white rounded-full"></span>
        </span>
        <span class="text-sm font-medium">{{ opt.name }}</span>
      </button>

      <div class="save-status" v-if="store.isSaving">
        <span class="spinner"></span> Menyimpan jawaban...
      </div>
      <div class="save-status offline" v-else-if="store.isOffline">
        ⚠️ Koneksi terputus, jawaban tersimpan secara lokal
      </div>
      <div class="save-status saved" v-else>
        ✅ Tersimpan
      </div>
    </div>
  </article>
</template>

<script setup>
import { onMounted, onUnmounted, computed } from 'vue';
import { useAssessmentStore } from '../stores/assessment'

const props = defineProps({
  question: Object,
  index: Number
})

const store = useAssessmentStore()
const isAnswered = computed(() => store.answers[props.question.id] !== undefined)

onMounted(() => {
  window.addEventListener('online', handleOnline);
});
onUnmounted(() => {
  window.removeEventListener('online', handleOnline);
});

const handleOnline = () => {
  store.flushPendingDrafts();
};
</script>

<style scoped>
.save-status {
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: #888;
  display: flex;
  justify-content: end;
  align-items: center;
  gap: 0.5rem;
  font-size: x-small;
}
.save-status.offline {
  color: #d48806; /* Kuning */
}
.save-status.saved {
  color: #52c41a; /* Hijau */
}
.spinner {
  width: 12px;
  height: 12px;
  border: 2px solid #ccc;
  border-top-color: #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>