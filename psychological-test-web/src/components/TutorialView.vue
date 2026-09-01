<template>
  <div class="grid lg:grid-cols-12 gap-10 py-12">
    <!-- Sidebar Scrollspy -->
    <aside class="lg:col-span-3">
      <div class="lg:sticky lg:top-24">
        <div class="text-[10px] uppercase tracking-[0.2em] text-muted mb-2">Daftar Isi</div>
        <h3 class="font-display text-xl font-medium mb-6">Panduan</h3>
        
        <nav class="space-y-1 border-l border-border">
          <a 
            v-for="section in guideStore.sections" 
            :key="section.id"
            :href="`#${section.id}`"
            @click="guideStore.setActiveSection(section.id)"
            :class="[
              'flex items-center gap-3 py-2.5 pl-4 -ml-px text-sm transition-all border-l-2',
              guideStore.activeSection === section.id 
                ? 'border-accent text-fg font-medium' 
                : 'border-transparent text-muted hover:text-fg hover:border-border'
            ]"
          >
            <span class="section-num text-xs">{{ section.num }}</span>
            <span>{{ section.label }}</span>
          </a>
        </nav>

        <div class="mt-8 p-5 bg-card border border-border rounded-xl">
          <div class="text-xs text-muted">Butuh bantuan?</div>
          <div class="font-display text-lg mt-1 mb-3">Hubungi Tim Kami</div>
          <a href="https://wa.me/6281232578168" class="px-4 w-full py-2.5 text-xs bg-fg text-bg rounded-full hover:bg-accent transition-colors">
            WhatsApp Message
          </a>
        </div>
      </div>
    </aside>

    <!-- Konten Utama -->
    <div class="lg:col-span-9 max-w-3xl">
      <div class="mb-16">
        <div class="flex items-center gap-3 text-xs text-muted mb-7">
          <span class="section-num font-medium">01 / 05</span>
          <span class="w-10 h-px bg-border"></span>
          <span class="uppercase tracking-[0.2em]">Panduan Penggunaan</span>
        </div>
        <h1 class="font-display text-5xl md:text-6xl lg:text-[5rem] font-light leading-[0.95] tracking-tight">
          Menyiapkan diri Anda<br>
          <em class="italic font-normal text-accent">untuk asesmen</em>.
        </h1>
        <p class="mt-7 text-lg text-muted max-w-xl leading-relaxed">
          Pelajari apa yang harus disiapkan sebelum mengerjakan tes, bagaimana platform ini bekerja, dan tips untuk memberikan hasil terbaik yang menggambarkan diri Anda yang sebenarnya.
        </p>
      </div>

      <GuideContent />
    </div>
  </div>
</template>

<script setup>
import { useGuideStore } from '../stores/guide'
import GuideContent from './guide/GuideContent.vue'

const guideStore = useGuideStore()
</script>