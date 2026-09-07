<template>
  <div>
		<SessionScanner v-if="!store.isSessionActive" />

    <template v-else>
			<div class="mt-8 flex justify-between items-center p-4 bg-accent2/10 border border-accent2/20 rounded-xl">
				<div class="flex items-center gap-3">
					<div class="w-8 h-8 rounded-full bg-accent2/20 flex items-center justify-center">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-accent2"><polyline points="20 6 9 17 4 12"/></svg>
					</div>
					<div>
						<div class="text-sm font-medium">Sesi terverifikasi</div>
						<div class="text-xs text-muted font-mono mt-0.5">Token: {{ store.strSessionToken }}</div>
					</div>
				</div>
				<button @click="store.clearSession()" class="text-xs text-muted hover:text-accent underline">
					Ganti Sesi
				</button>
			</div>

      <section class="py-16 border-t border-border">
        <div class="flex items-end justify-between mb-8 flex-wrap gap-3">
          <div>
            <div class="text-[10px] uppercase tracking-[0.2em] text-muted mb-2">Dalam sesi ini</div>
            <h2 class="font-display text-3xl lg:text-4xl font-light">Tahapan asesmen</h2>
          </div>
          <div class="text-sm text-muted">{{ store.totalTest }} instrumen · estimasi total {{ store.estimatedTime }} menit</div>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4 min-w-full">

          <div 
            v-for="(test, index) in store.tests"
            :key="test.id"
            :class="[
              'relative border rounded-2xl p-6 transition-all hover:-translate-y-0.5 min-w-72',
              test.state == 'progress' 
              ? 'bg-fg border-fg opacity-100' 
              : 'bg-card border-border opacity-70 hover:opacity-100',
            ]">
            <div class="absolute top-5 right-5">
              <span 
                :class="[
                  'inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-medium',
                  test.state == 'assign' ? 'text-muted' : '',
                  test.state == 'progress' ? 'text-bg/70' : '',
                  test.state == 'done' ? 'text-accent2' : '',
                ]">
                <svg v-if="test.state == 'assign'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                <svg v-if="test.state == 'done'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                <span v-if="test.state == 'progress'" class="w-1.5 h-1.5 rounded-full bg-accent live-dot"></span>
                {{ STATE_TEST[test.state] }}
              </span>
            </div>
            <div :class="[
              'text-[10px] uppercase tracking-[0.18em] mb-2',
                  test.state == 'progress' ? 'text-bg/60' : 'text-muted',
            ]">
              {{ String(index+1).padStart(2, '0') }} · {{ test.topic }}
            </div>
            <div :class="[
              'font-display text-xl font-medium leading-tight mb-3',
              test.state == 'progress' ? 'text-bg/60' : '',
            ]">
              {{ test.name || '-' }}</div>
            <div :class="[
              'text-xs leading-relaxed',
              test.state == 'progress' ? 'text-bg/70' : 'text-muted',
            ]">
              {{ test.question_count }} item · {{ test.time }} mnt
            </div>
            <div class="mt-4 border-t border-border py-3 flex justify-between space-x-3">
              <button @click="startTest(test.id)" v-if="test.state == 'assign'" class="px-4 w-full py-2.5 text-xs bg-muted text-bg rounded-full hover:bg-accent transition-colors">
                Mulai
              </button>
              <button @click="resumeTest(test.id)" v-if="test.state == 'progress'" class="px-4 w-full py-2.5 text-xs bg-muted text-bg rounded-full hover:bg-accent transition-colors">
                Lanjutkan
              </button>
              <button @click="stopTest(test.id)" v-if="test.state == 'progress'" class="px-4 w-full py-2.5 text-xs bg-muted text-bg rounded-full hover:bg-accent transition-colors">
                Selesai
              </button>
            </div>
          </div>

        </div>
      </section>
		</template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAssessmentStore } from '@/stores/assessment'
import SessionScanner from '@/components/SessionScanner.vue'
import { showSuccess, showError, showLoading, closeAlert } from '@/utils/alerts'

const STATE_TEST = {
  'draft': 'Draft',
  'assign': 'Berikutnya',
  'progress': 'Sedang Berlangsung',
  'done': 'Selesai',
  'cancel': 'Batal'
}

const router = useRouter()
const store = useAssessmentStore()

async function startTest(testId) {
  if(testId) {
    const isSuccess = await store.startSessionTest(testId)
    if (!isSuccess) {
      showError('ID Tes tidak ditemukan!.')
    } else {
      router.push('/asesmen')
    }
  } else {
    showError('ID Tes tidak valid.')
  }
}

async function resumeTest(testId) {
  if(testId) {
    const isSuccess = await store.resumeSessionTest(testId)
    if (!isSuccess) {
      showError('ID Tes tidak ditemukan!.')
    } else {
      router.push('/asesmen')
    }
  } else {
    showError('ID Tes tidak valid.')
  }
}

async function stopTest(testId) {
  if(testId) {
    const isSuccess = await store.stopSessionTest(testId)
    if (!isSuccess) {
      showError('ID Tes tidak ditemukan!.')
    } else {
      router.push('/')
    }
  } else {
    showError('ID Tes tidak valid.')
  }
} 

</script>