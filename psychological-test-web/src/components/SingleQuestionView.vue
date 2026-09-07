<template>
  <div class="grid lg:grid-cols-12 gap-8">
    <aside class="lg:col-span-3 order-2 lg:order-1">
      <div class="lg:sticky lg:top-24">
        <div class="flex items-center justify-between mb-4">
          <div class="text-[10px] uppercase tracking-[0.2em] text-muted">Navigasi Soal</div>
          <span class="text-xs text-muted section-num">{{ store.currentQuestionIndex + 1 }} / {{ store.totalQuestions }}</span>
        </div>
        
        <div class="grid grid-cols-5 gap-1.5 mb-6 p-3 bg-card border border-border rounded-xl">
          <button 
            v-for="(q, i) in store.questions" 
            :key="q.id"
            @click="store.goToQuestion(i)"
            :class="[
              'q-cell aspect-square rounded-md border text-xs flex items-center justify-center section-num transition-all relative',
              store.currentQuestionIndex === i ? 'bg-fg text-bg border-fg scale-105 shadow-md' :
              store.answers[q.id] ? 'bg-accent text-white border-accent' :
              'bg-card border-border hover:border-fg hover:-translate-y-0.5'
            ]"
          >
            {{ i + 1 }}
            <span v-if="store.flagged.includes(q.id)" class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent2 border-2 border-bg"></span>
          </button>
        </div>
        
        <div class="space-y-2.5 text-xs pt-5 border-t border-border">
          <div class="flex items-center gap-2.5">
            <span class="w-3.5 h-3.5 rounded bg-accent border border-accent"></span>
            <span class="text-muted">Terjawab ({{ store.answeredCount }})</span>
          </div>
          <div class="flex items-center gap-2.5">
            <span class="w-3.5 h-3.5 rounded bg-fg border border-fg"></span>
            <span class="text-muted">Soal saat ini</span>
          </div>
          <div class="flex items-center gap-2.5">
            <span class="w-3.5 h-3.5 rounded bg-card border border-border"></span>
            <span class="text-muted">Belum dijawab</span>
          </div>
          <!-- <div class="flex items-center gap-2.5">
            <span class="w-3.5 h-3.5 rounded bg-card border border-border relative">
              <span class="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-accent2"></span>
            </span>
            <span class="text-muted">Ditandai ({{ store.flagged.length }})</span>
          </div> -->
        </div>
      </div>
    </aside>
    
    <!-- Question area -->
    <div class="lg:col-span-9 order-1 lg:order-2">
      <article class="bg-card border border-border rounded-2xl p-8 lg:p-12 min-h-120 flex flex-col">
        <div class="flex items-center justify-between mb-8">
          <div class="text-sm text-muted">
            Pernyataan <span class="text-fg font-medium section-num">{{ store.currentQuestionIndex + 1 }}</span> dari <span class="section-num">{{ store.totalQuestions }}</span>
          </div>
          <!-- <button 
            @click="store.toggleFlag(store.currentQuestion.id)"
            :class="store.flagged.includes(store.currentQuestion.id) ? 'text-accent2' : 'text-muted hover:text-accent2'"
            class="inline-flex items-center gap-2 text-xs transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" :fill="store.flagged.includes(store.currentQuestion.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2"><path d="M5 3v18M5 4h12l-2 4 2 4H5"/></svg>
            <span class="uppercase tracking-wider font-medium">{{ store.flagged.includes(store.currentQuestion.id) ? 'Tandai ✓' : 'Tandai' }}</span>
          </button> -->
        </div>
        
        <div class="flex-1 flex flex-col justify-center">
          <div class="text-[10px] uppercase tracking-[0.2em] text-accent mb-4">Dimensi: {{ store.currentQuestion.dimension_name }}</div>
          <transition name="fade" mode="out-in">
            <p :key="store.currentQuestion.id" class="font-display text-3xl lg:text-[2.5rem] font-light leading-[1.15] mb-12 max-w-3xl">
              {{ store.currentQuestion.title }}
            </p>
          </transition>
          
          <div class="max-w-2xl">
            <div v-if="store.currentQuestion.type === 'likert'">
              <div class="flex justify-between text-xs text-muted mb-3 px-1">
                <span class="font-medium">Sangat tidak setuju</span>
                <span>Netral</span>
                <span class="font-medium">Sangat setuju</span>
              </div>
              <div class="grid grid-cols-5 gap-2">
                <!-- <button 
                  v-for="val in 5" 
                  :key="val"
                  @click="store.saveDraftAnswers(store.currentQuestion.id, val)"
                  :class="[
                    'group py-4 rounded-xl border transition-all flex flex-col items-center gap-2.5',
                    store.answers[store.currentQuestion.id] === val ? 'border-accent bg-accent/5' : 'border-border hover:border-fg'
                  ]"
                >
                  <span :class="[
                    'w-5 h-5 rounded-full border-2 transition-all',
                    store.answers[store.currentQuestion.id] === val ? 'border-accent bg-accent' : 'border-border group-hover:border-accent'
                  ]"></span>
                  <span class="text-xs text-muted section-num">{{ val }}</span>
                </button> -->
                <button 
                  v-for="opt in store.currentQuestion.answers" 
                  :key="opt.answer_id"
                  @click="store.saveDraftAnswers(store.currentQuestion.id, opt.answer_id)"
                  :class="[
                    'py-2 rounded-lg flex flex-col items-center gap-1.5 border border-transparent transition-all',
                    Number(store.answers[store.currentQuestion.id]) === opt.answer_id && 'bg-accent/5'
                  ]"
                >
                  <span :class="[
                    'dot w-4 h-4 rounded-full border-[1.5px] border-border relative transition-all',
                    Number(store.answers[store.currentQuestion.id]) === opt.answer_id && 'bg-accent border-accent scale-110'
                  ]">
                    <span v-if="Number(store.answers[store.currentQuestion.id]) === opt.answer_id" class="absolute inset-1 bg-white rounded-full"></span>
                  </span>
                  <span :class="[
                    'num text-[10px] transition-colors',
                    Number(store.answers[store.currentQuestion.id]) === opt.answer_id ? 'text-accent font-semibold' : 'text-muted'
                  ]">{{ opt.name }}</span>
                </button>

              </div>
            </div>

            <div v-else-if="store.currentQuestion.type === 'multiple'" class="space-y-3">
              <button 
                v-for="opt in store.currentQuestion.answers" 
                :key="opt.answer_id"
                @click="store.saveDraftAnswers(store.currentQuestion.id, opt.answer_id)"
                :class="[
                  'w-full text-left p-5 rounded-xl border flex items-center gap-4 transition-all',
                  Number(store.answers[store.currentQuestion.id]) === opt.answer_id 
                    ? 'border-accent bg-accent/5' 
                    : 'border-border hover:border-fg hover:bg-subtle'
                ]"
              >
                <span :class="[
                  'w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-all',
                  Number(store.answers[store.currentQuestion.id]) === opt.answer_id ? 'border-accent bg-accent' : 'border-border'
                ]">
                  <span v-if="Number(store.answers[store.currentQuestion.id]) === opt.answer_id" class="w-2.5 h-2.5 bg-white rounded-full"></span>
                </span>
                <span class="text-base font-medium">{{ opt.name }}</span>
              </button>
            </div>
            
            <div class="mt-4 text-xs text-muted">
              Pilih nilai yang paling menggambarkan diri Anda. Anda dapat mengubah jawaban kapan saja sebelum sesi berakhir.
            </div>

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
      </article>
      
      <div class="flex items-center justify-between mt-6 gap-4">
        <button 
          @click="store.prevQuestion()" 
          :disabled="store.currentQuestionIndex === 0"
          class="inline-flex items-center gap-2.5 px-5 py-3 text-sm border border-border rounded-full hover:border-fg hover:bg-card transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          <span>Sebelumnya</span>
        </button>
        
        <button 
          @click="store.nextQuestion()" 
          v-if="store.currentQuestionIndex !== store.totalQuestions - 1"
          class="inline-flex items-center gap-2.5 px-5 py-3 text-sm bg-fg text-bg rounded-full hover:bg-accent transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span>Berikutnya</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>

        <button 
          @click="stopSessionTest" 
          v-else
          class="inline-flex items-center gap-2.5 px-5 py-3 text-sm bg-fg text-bg rounded-full hover:bg-accent transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span>Selesai</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, computed } from 'vue';
import { useAssessmentStore } from '../stores/assessment'
const store = useAssessmentStore()

onMounted(() => {
  window.addEventListener('online', handleOnline);
});
onUnmounted(() => {
  window.removeEventListener('online', handleOnline);
});

async function stopSessionTest() {
  const isSuccess = store.stopSessionTest(store.currentTestData.session_test_id)
  if (!isSuccess) {
    showError('Gagal Menyelesaikan Tes')
  } else {
    router.push('/beranda')
  }
}

const handleOnline = () => {
  store.flushPendingDrafts();
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.25s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
.save-status {
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: #888;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: end;
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