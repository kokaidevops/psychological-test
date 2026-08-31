import { createRouter, createWebHistory } from 'vue-router'
import AssessmentView from '@/components/AssessmentView.vue'
import HomeView from '@/components/HomeView.vue'
import TutorialView from '@/components/TutorialView.vue'

const routes = [
  { path: '/', name: 'tutorial', component: TutorialView },
  { path: '/beranda', name: 'beranda', component: HomeView },
  { path: '/asesmen', name: 'assessment', component: AssessmentView }
]

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0 }
  }
})