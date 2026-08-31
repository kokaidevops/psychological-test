<template>
  <section class="py-16 border-t border-border">
    <div class="flex items-end justify-between mb-8 flex-wrap gap-3">
      <div>
        <div class="text-[10px] uppercase tracking-[0.2em] text-muted mb-2">Dalam sesi ini</div>
        <h2 class="font-display text-3xl lg:text-4xl font-light">Tahapan asesmen</h2>
      </div>
      <div class="text-sm text-muted">4 instrumen · estimasi total 55 menit</div>
    </div>
    
    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Test 1: done -->
      <div class="relative bg-card border border-border rounded-2xl p-6 opacity-70 transition-all hover:opacity-100 hover:-translate-y-0.5">
        <div class="absolute top-5 right-5">
          <span class="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-accent2 font-medium">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
            Selesai
          </span>
        </div>
        <div class="text-[10px] uppercase tracking-[0.18em] text-muted mb-2">01 · Kognitif</div>
        <div class="font-display text-xl font-medium leading-tight mb-3">Numerical Reasoning</div>
        <div class="text-xs text-muted leading-relaxed">25 item · 12 mnt</div>
      </div>
      
      <!-- Test 2: current -->
      <div class="relative bg-fg text-bg border border-fg rounded-2xl p-6 transition-all hover:-translate-y-0.5">
        <div class="absolute top-5 right-5">
          <span class="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-medium">
            <span class="w-1.5 h-1.5 rounded-full bg-accent live-dot"></span>
            Sedang dikerjakan
          </span>
        </div>
        <div class="text-[10px] uppercase tracking-[0.18em] text-bg/60 mb-2">02 · Kepribadian</div>
        <div class="font-display text-xl font-medium leading-tight mb-3">HEXACO-PI-R</div>
        <div class="text-xs text-bg/70 leading-relaxed">60 item · 15 mnt</div>
      </div>
      
      <!-- Test 3: upcoming -->
      <div class="relative bg-card border border-border rounded-2xl p-6 transition-all hover:-translate-y-0.5 hover:border-fg">
        <div class="absolute top-5 right-5">
          <span class="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
            Berikutnya
          </span>
        </div>
        <div class="text-[10px] uppercase tracking-[0.18em] text-muted mb-2">03 · Berpikir kritis</div>
        <div class="font-display text-xl font-medium leading-tight mb-3">Watson-Glaser III</div>
        <div class="text-xs text-muted leading-relaxed">40 item · 20 mnt</div>
      </div>
      
      <!-- Test 4: upcoming -->
      <div class="relative bg-card border border-border rounded-2xl p-6 transition-all hover:-translate-y-0.5 hover:border-fg">
        <div class="absolute top-5 right-5">
          <span class="text-[10px] uppercase tracking-wider text-muted">Terakhir</span>
        </div>
        <div class="text-[10px] uppercase tracking-[0.18em] text-muted mb-2">04 · Situational</div>
        <div class="font-display text-xl font-medium leading-tight mb-3">Situational Judgement</div>
        <div class="text-xs text-muted leading-relaxed">25 item · 8 mnt</div>
      </div>
    </div>
  </section>
</template>