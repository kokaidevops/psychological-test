<template>
  <header class="border-b border-border bg-bg/85 backdrop-blur-md sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
      <RouterLink to="/" class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-fg flex items-center justify-center">
          <span class="font-display text-bg text-lg italic font-medium">K</span>
        </div>
        <div>
          <div class="font-display text-lg font-medium leading-none">Kokai Careers</div>
          <div class="text-[10px] text-muted mt-1 tracking-[0.18em] uppercase">Asesmen Platform</div>
        </div>
      </RouterLink>
      
      <nav class="hidden md:flex items-center gap-7 text-sm">
        <RouterLink to="/" class-active="text-fg border-b border-fg pb-0.5" class="text-muted hover:text-fg transition-colors">Panduan</RouterLink>
        <RouterLink to="/beranda" class="text-muted hover:text-fg transition-colors">Beranda</RouterLink>
        <RouterLink to="/asesmen" class="text-muted hover:text-fg transition-colors">Asesmen</RouterLink>
      </nav>
      
      <!-- Right Side Actions -->
      <div class="flex items-center gap-5 z-50">
        
        <div v-if="assessmentStore.user" class="hidden sm:flex w-9 h-9 rounded-full bg-accent2/10 border border-accent2/20 items-center justify-center text-accent2 text-xs font-semibold">{{ assessmentStore.user }}</div>
        <RouterLink v-if="assessmentStore.user" to="/" class="hidden sm:flex w-9 h-9 rounded-full items-center justify-center text-muted text-xs font-semibold">
          <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 17L21 12M21 12L16 7M21 12H9M12 17C12 17.93 12 18.395 11.8978 18.7765C11.6204 19.8117 10.8117 20.6204 9.77646 20.8978C9.39496 21 8.92997 21 8 21H7.5C6.10218 21 5.40326 21 4.85195 20.7716C4.11687 20.4672 3.53284 19.8831 3.22836 19.1481C3 18.5967 3 17.8978 3 16.5V7.5C3 6.10217 3 5.40326 3.22836 4.85195C3.53284 4.11687 4.11687 3.53284 4.85195 3.22836C5.40326 3 6.10218 3 7.5 3H8C8.92997 3 9.39496 3 9.77646 3.10222C10.8117 3.37962 11.6204 4.18827 11.8978 5.22354C12 5.60504 12 6.07003 12 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </RouterLink>

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
            <div v-if="assessmentStore.user" class="w-9 h-9 rounded-full bg-accent2/10 border border-accent2/20 flex items-center justify-center text-accent2 text-xs font-semibold">{{ assessmentStore.user }}</div>
            <RouterLink v-if="assessmentStore.user" to="/" class="w-9 h-9 pt-2 items-center justify-center text-muted text-xs font-semibold">
              <svg width="80%" height="80%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 17L21 12M21 12L16 7M21 12H9M12 17C12 17.93 12 18.395 11.8978 18.7765C11.6204 19.8117 10.8117 20.6204 9.77646 20.8978C9.39496 21 8.92997 21 8 21H7.5C6.10218 21 5.40326 21 4.85195 20.7716C4.11687 20.4672 3.53284 19.8831 3.22836 19.1481C3 18.5967 3 17.8978 3 16.5V7.5C3 6.10217 3 5.40326 3.22836 4.85195C3.53284 4.11687 4.11687 3.53284 4.85195 3.22836C5.40326 3 6.10218 3 7.5 3H8C8.92997 3 9.39496 3 9.77646 3.10222C10.8117 3.37962 11.6204 4.18827 11.8978 5.22354C12 5.60504 12 6.07003 12 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </RouterLink>
          </div>
        </nav>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAssessmentStore } from '@/stores/assessment'

const assessmentStore = useAssessmentStore()
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