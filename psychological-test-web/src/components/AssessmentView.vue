<template>
    <div>
        <!-- Tampilkan Scanner jika sesi belum aktif -->
        <SessionScanner v-if="!store.isSessionActive" />

        <template v-else>
            <!-- Banner Token Aktif -->
            <div class="mt-8 flex justify-between items-center p-4 bg-accent2/10 border border-accent2/20 rounded-xl">
                <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-accent2/20 flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-accent2"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div>
                    <div class="text-sm font-medium">Sesi terverifikasi</div>
                    <div class="text-xs text-muted font-mono mt-0.5">Token: {{ store.sessionToken }}</div>
                </div>
                </div>
                <button @click="store.clearSession()" class="text-xs text-muted hover:text-accent underline">
                Ganti Sesi
                </button>
            </div>

            <!-- Konten Assesmen Asli -->
            <AssessmentSection />
            <CallToAction />
        </template>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAssessmentStore } from '@/stores/assessment'
import SessionScanner from '@/components/SessionScanner.vue'
import AssessmentSection from './AssessmentSection.vue'
import CallToAction from './CallToAction.vue'

const progress = computed(() => store.progress)
const store = useAssessmentStore()
</script>