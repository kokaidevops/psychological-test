<template>
  <article ref="contentRef" class="space-y-20">
    <!-- Persiapan -->
    <section id="persiapan" class="scroll-mt-24">
      <h2 class="font-display text-3xl font-medium mb-6">01 — Persiapan</h2>
      <p class="text-muted leading-relaxed mb-8">
        Sebelum memulai sesi asesmen, pastikan Anda menyiapkan hal-hal berikut agar proses pengerjaan berjalan lancar dan tanpa gangguan.
      </p>
      <div class="grid md:grid-cols-2 gap-4">
        <div class="bg-card border border-border rounded-2xl p-6 transition-all hover:border-fg hover:-translate-y-0.5">
          <div class="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-accent"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
          </div>
          <h3 class="font-display text-lg font-medium mb-2">Perangkat & Browser</h3>
          <p class="text-sm text-muted leading-relaxed">Gunakan laptop atau desktop dengan browser modern (Chrome, Edge, Safari). Hindari mengakses via ponsel agar antarmuka soal terlihat optimal.</p>
        </div>
        <div class="bg-card border border-border rounded-2xl p-6 transition-all hover:border-fg hover:-translate-y-0.5">
          <div class="w-10 h-10 rounded-lg bg-accent2/10 flex items-center justify-center mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-accent2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
          </div>
          <h3 class="font-display text-lg font-medium mb-2">Koneksi Stabil</h3>
          <p class="text-sm text-muted leading-relaxed">Pastikan koneksi internet stabil. Jawaban Anda tersimpan otomatis, namun koneksi terputus dapat mengganggu konsentrasi.</p>
        </div>
      </div>
    </section>

    <!-- Pelaksanaan -->
    <section id="pelaksanaan" class="scroll-mt-24">
      <h2 class="font-display text-3xl font-medium mb-6">02 — Pelaksanaan</h2>
      <p class="text-muted leading-relaxed mb-8">
        Platform kami dirancang fleksibel. Anda dapat memilih mode pengerjaan yang paling nyaman untuk Anda di halaman utama asesmen.
      </p>
      
      <div class="space-y-4">
        <div class="flex items-start gap-5 p-5 bg-subtle border border-border rounded-xl">
          <span class="font-display text-2xl text-accent section-num">01</span>
          <div>
            <h4 class="font-medium mb-1">Mode Semua Soal</h4>
            <p class="text-sm text-muted leading-relaxed">Menampilkan seluruh pertanyaan dalam bentuk grid. Cocok bagi Anda yang ingin melihat gambaran besar soal dan menjawab secara melompat.</p>
          </div>
        </div>
        <div class="flex items-start gap-5 p-5 bg-subtle border border-border rounded-xl">
          <span class="font-display text-2xl text-accent section-num">02</span>
          <div>
            <h4 class="font-medium mb-1">Mode Satu Soal</h4>
            <p class="text-sm text-muted leading-relaxed">Fokus pada satu pertanyaan dalam satu waktu, dilengkapi dengan navigasi nomor soal. Sangat ideal untuk meminimalkan distraksi.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Tips Sukses -->
    <section id="tips" class="scroll-mt-24">
      <h2 class="font-display text-3xl font-medium mb-6">03 — Tips Sukses</h2>
      <div class="bg-fg text-bg p-8 rounded-2xl">
        <ul class="space-y-5">
          <li class="flex items-start gap-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0 mt-1 text-accent"><polyline points="20 6 9 17 4 12"/></svg>
            <span class="leading-relaxed"><strong>Jawab dengan jujur.</strong> Tes kepribadian dirancang untuk mendeteksi inkonsistensi. Jangan mencoba menebak jawaban yang "diinginkan" perusahaan.</span>
          </li>
          <li class="flex items-start gap-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0 mt-1 text-accent"><polyline points="20 6 9 17 4 12"/></svg>
            <span class="leading-relaxed"><strong>Pilih lingkungan yang tenang.</strong> Matifikasi notifikasi ponsel agar Anda dapat fokus sepenuhnya pada instruksi dan konteks soal.</span>
          </li>
          <li class="flex items-start gap-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0 mt-1 text-accent"><polyline points="20 6 9 17 4 12"/></svg>
            <span class="leading-relaxed"><strong>Percayai insting pertama Anda.</strong> Jangan terlalu lama memikirkan satu pertanyaan. Pilih opsi yang paling mendekati diri Anda secara spontan.</span>
          </li>
        </ul>
      </div>
    </section>

    <!-- Keamanan Data -->
    <section id="keamanan" class="scroll-mt-24">
      <h2 class="font-display text-3xl font-medium mb-6">04 — Keamanan Data</h2>
      <p class="text-muted leading-relaxed">
        Privasi Anda adalah prioritas kami. Seluruh data jawaban dienkripsi end-to-end dan hanya akan diakses oleh tim HR perusahaan yang mengundang Anda. Kami mematuhi standar perlindungan data pribadi (UU PDP) dan tidak akan membagikan hasil Anda kepada pihak ketiga tanpa persetujuan.
      </p>
    </section>

    <!-- FAQ -->
    <section id="faq" class="scroll-mt-24">
      <h2 class="font-display text-3xl font-medium mb-6">05 — Pertanyaan Umum</h2>
      <div class="space-y-3 border-t border-border pt-4">
        <FaqItem 
          v-for="faq in guideStore.faqs" 
          :key="faq.id" 
          :faq="faq" 
        />
      </div>
    </section>
  </article>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useGuideStore } from '../../stores/guide.js'
import FaqItem from './FaqItem.vue'

const guideStore = useGuideStore()
const contentRef = ref(null)
let observer = null

onMounted(() => {
  // Setup Intersection Observer untuk Scrollspy
  const sections = document.querySelectorAll('section[id]')
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        guideStore.setActiveSection(entry.target.id)
      }
    })
  }, { rootMargin: '-30% 0px -60% 0px' }) // Trigger saat section ada di tengah layar

  sections.forEach(sec => observer.observe(sec))
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>