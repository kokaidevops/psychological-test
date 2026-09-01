import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAssessmentStore = defineStore('assessment', () => {
  const mode = ref(2) // 1: Semua soal, 2: Satu soal
  const currentQuestionIndex = ref(0)
  const answers = ref({}) // Format: { questionId: value }
  const flagged = ref([]) // Array of questionIds
  const sessionToken = ref(null)
  const isSessionActive = ref(false)
  const user = ref("")
  
  // Mock Data (10 pertanyaan untuk demo)
  const questions = ref([
    { id: 1, dim: "Ekstraversi", text: "Saya menikmati menjadi pusat perhatian dalam kelompok sosial yang besar." },
    { id: 2, dim: "Kesepakatan", text: "Saya jarang peduli apakah saya sesuai dengan norma-norma sosial yang berlaku di lingkungan saya." },
    { id: 3, dim: "Emosionalitas", text: "Saya cenderung mengkhawatirkan banyak hal ketika menghadapi situasi yang tidak pasti." },
    { id: 4, dim: "Kejujuran", text: "Saya dengan senang hati meminjamkan barang milik saya kepada orang lain, bahkan yang baru saya kenal." },
    { id: 5, dim: "Kesungguhan", text: "Saya mendorong diri saya untuk mencapai standar tertinggi dalam setiap pekerjaan yang saya kerjakan." },
    { id: 6, dim: "Keterbukaan", text: "Saya merasa nyaman berada di tengah perdebatan yang kompleks dan berkepanjangan." },
    { id: 7, dim: "Ekstraversi", text: "Saya merasa berenergi ketika berinteraksi dengan banyak orang baru." },
    { id: 8, dim: "Emosionalitas", text: "Saya mudah terpengaruh secara emosional oleh situasi yang sulit di sekitar saya." },
    { id: 9, dim: "Kesepakatan", text: "Saya cenderung memaafkan orang lain dengan mudah setelah mereka melakukan kesalahan." },
    { id: 10, dim: "Kejujuran", text: "Saya tidak akan mengambil keuntungan dari orang lain bahkan jika ada kesempatan." }
  ])

  const totalQuestions = computed(() => questions.value.length)
  const answeredCount = computed(() => Object.keys(answers.value).length)
  const progress = computed(() => (answeredCount.value / totalQuestions.value) * 100)
  
  const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])

  function setMode(m) {
    mode.value = m
  }

  function setAnswer(qId, val) {
    answers.value[qId] = val
  }

  function nextQuestion() {
    if (currentQuestionIndex.value < totalQuestions.value - 1) {
      currentQuestionIndex.value++
    }
  }

  function prevQuestion() {
    if (currentQuestionIndex.value > 0) {
      currentQuestionIndex.value--
    }
  }

  function goToQuestion(index) {
    currentQuestionIndex.value = index
  }

  function toggleFlag(qId) {
    const index = flagged.value.indexOf(qId)
    if (index > -1) {
      flagged.value.splice(index, 1)
    } else {
      flagged.value.push(qId)
    }
  }

  function setSessionToken(token) {
    sessionToken.value = token
    isSessionActive.value = true
  }

  function clearSession() {
    sessionToken.value = null
    isSessionActive.value = false
    // Reset progress jika perlu
    answers.value = {}
    currentQuestionIndex.value = 0
    flagged.value = []
  }

  return {
    mode, currentQuestionIndex, answers, flagged, questions,
    totalQuestions, answeredCount, progress, currentQuestion,
    sessionToken, isSessionActive,
    setMode, setAnswer, nextQuestion, prevQuestion, goToQuestion, toggleFlag,
    setSessionToken, clearSession
  }
})