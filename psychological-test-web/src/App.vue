<template>
  <div class="min-h-screen flex flex-col">
    <div class="fixed top-0 left-0 right-0 h-0.75 bg-border z-50">
      <div class="h-full bg-accent transition-all duration-800 ease-out" style="width: 42%"></div>
    </div>
    
    <AppHeader />
    <main class="max-w-7xl mx-auto px-6 lg:px-10 flex-1">
      <RouterView v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>