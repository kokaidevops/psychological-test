<template>
  <header class="border-b border-border bg-bg/85 backdrop-blur-md sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
      <RouterLink to="/" class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-fg flex items-center justify-center">
          <span class="font-display text-bg text-lg italic font-medium">K</span>
        </div>
        <div>
          <div class="font-display text-lg font-medium leading-none">Kokai Careers</div>
          <div class="text-[10px] text-muted mt-1 tracking-[0.18em] uppercase">Psychological Test Platform</div>
        </div>
      </RouterLink>
      
      <nav class="hidden md:flex items-center gap-7 text-sm">
        <RouterLink to="/" class-active="text-fg border-b border-fg pb-0.5" class="text-muted hover:text-fg transition-colors">Panduan</RouterLink>
        <RouterLink to="/beranda" class="text-muted hover:text-fg transition-colors">Beranda</RouterLink>
        <RouterLink to="/asesmen" class="text-muted hover:text-fg transition-colors">Asesmen</RouterLink>
      </nav>
      
      <!-- Right Side Actions -->
      <div class="flex items-center gap-5 z-50">
        
        <div class="hidden sm:flex w-9 h-9 rounded-full bg-accent2/10 border border-accent2/20 items-center justify-center text-accent2 text-xs font-semibold">AS</div>

        <!-- Hamburger Button (Mobile Only) -->
        <button 
          @click="toggleMenu" 
          class="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:border-fg transition-colors"
          aria-label="Toggle Menu"
        >
          <svg v-if="!isMenuOpen" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="6"/>
            <line x1="6" y1="18" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Menu Drawer -->
    <transition name="mobile-menu">
      <div v-if="isMenuOpen" class="md:hidden absolute top-full left-0 right-0 bg-bg border-b border-border shadow-lg">
        <nav class="flex flex-col p-6 gap-2">
          <RouterLink 
            to="/" 
            @click="closeMenu" 
            class="py-3 px-4 rounded-lg text-base text-fg hover:bg-subtle transition-colors font-medium"
          >
            Panduan
          </RouterLink>
          <RouterLink 
            to="/beranda" 
            @click="closeMenu" 
            class="py-3 px-4 rounded-lg text-base text-fg hover:bg-subtle transition-colors font-medium"
          >
            Beranda
          </RouterLink>
          <RouterLink 
            to="/asesmen" 
            @click="closeMenu" 
            class="py-3 px-4 rounded-lg text-base text-fg hover:bg-subtle transition-colors font-medium"
          >
            Asesmen
          </RouterLink>
          
          <div class="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <div class="w-9 h-9 rounded-full bg-accent2/10 border border-accent2/20 flex items-center justify-center text-accent2 text-xs font-semibold">AS</div>
          </div>
        </nav>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}
</script>

<style scoped>
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.3s ease;
  max-height: 400px;
}
.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}
</style>