import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { showSuccess, showError, showLoading, closeAlert } from '@/utils/alerts'
import { 
  verifyTokenRequest, 
  logout, 
  getTests, 
  startSession,
  saveDraft,
  stopSession,
  postResumeSession,
  getResumeSession
} from '@/api/assessment'

const setStoredData = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}
const getStoredData = (key, fallback = null) => {
  if (typeof window === 'undefined') return fallback
  const item = window.localStorage.getItem(key)
  try {
    return item ? JSON.parse(item) : fallback
  } catch (error) {
    return item || fallback
  }
}
const removeStoredData = (key) => {
  localStorage.removeItem(key)
}

export const useAssessmentStore = defineStore('assessment', () => {
  const isSessionActive = ref(getStoredData('kokai_session_active', false))
  const sessionToken = ref(getStoredData('kokai_session_token', null))
  const sessionData = ref(getStoredData('kokai_session_data', null))
  const user = ref(getStoredData('kokai_user', null))
  const strSessionToken = ref(`***${sessionToken.value?.slice(-3)}` || null)

  const mode = ref(2)

  const tests = ref(getStoredData('kokai_test_data'), [])
  const currentTestId = ref(getStoredData('kokai_current_test_id'), null)
  const currentTestData = ref(getStoredData('kokai_current_test_data'), null)

  const questions = ref(currentTestData.value?.questions || [])
  const currentQuestionIndex = ref(0)
  const answers = ref({})
  const flagged = ref([])

  const totalTests = computed(() => tests.value?.length || 0)
  const totalQuestions = computed(() => questions.value.length)
  const answeredCount = computed(() => Object.keys(answers.value).length)
  const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
  const estimatedTime = computed(() => tests.value?.reduce((acc, test) => acc + test.time, 0) || 0)

  const isSaving = ref(false)
  const isOffline = ref(false)
  const pendingDrafts = ref({})

  async function verifySessionToken(token) {
    showLoading('Memverifikasi token sesi...')

    try {
      const response = await verifyTokenRequest(token)
      const data = response.data?.data
      const initial_name = data?.applicant_name.match(/\b(\w)/g)?.slice(0, 2).join("").toUpperCase()

      closeAlert()

      isSessionActive.value = true
      sessionData.value = data
      sessionToken.value = token
      strSessionToken.value = `***${token.slice(-3)}`
      user.value = initial_name

      const getTestsResponse = await getTests()
      const getTestsData = getTestsResponse.data?.data
      tests.value = getTestsData
      
      setStoredData('kokai_session_active', true)
      setStoredData('kokai_session_data', data)
      setStoredData('kokai_session_token', token)
      setStoredData('kokai_user', initial_name)
      setStoredData('kokai_test_data', getTestsData)

      await showSuccess('Sesi Terverifikasi!', 'Anda akan diarahkan ke tahapan sesi asesmen.')

      return true
    } catch (error) {
      closeAlert()
      clearSession()

      const message = error.response?.message || 'Gagal memverifikasi token. Coba lagi.'
      await showError('Verifikasi Gagal', message)

      return false
    } finally {
    
    }
  }

  async function startSessionTest(test_id) {
    const storedTest = localStorage.getItem('kokai_current_test_data')
    if ((storedTest && currentTestId.value) && currentTestId.value == test_id) {
      currentTestData.value = JSON.parse(storedTest)
      return true
    } else {
      removeStoredData('kokai_current_test_data')
      removeStoredData('kokai_current_test_id')

      clearTestData()
    }

    showLoading('Menyiapkan tes Anda...')

    try {
      const response = await startSession(test_id, sessionToken.value)
      const testData = response.data

      if (!testData.success) return false

      closeAlert()

      currentTestData.value = testData?.data
      currentTestId.value = test_id
      setStoredData('kokai_current_test_id', test_id)
      setStoredData('kokai_current_test_data', currentTestData.value)

      questions.value = testData?.data?.questions || []

      setStoredData('kokai_test_data', testData?.test_data)
      tests.value = testData?.test_data

      await showSuccess('Tes Siap Dikerjakan!', `Instrumen ${testData?.data.test_name || ''} berhasil dimuat.`)

      return true
    } catch (error) {
      closeAlert()
      const message = error.response?.message || 'Gagal mengambil data tes. Sesi mungkin tidak valid.'

      await showError('Gagal Memuat Tes', message)
      throw error
    } finally {
      closeAlert()
    }
  }

  function setMode(m) { mode.value = m }
  function nextQuestion() { if (currentQuestionIndex.value < totalQuestions.value - 1) { currentQuestionIndex.value++ } }
  function prevQuestion() { if (currentQuestionIndex.value > 0) { currentQuestionIndex.value-- } }
  function goToQuestion(index) { currentQuestionIndex.value = index }
  function toggleFlag(qId) {
    const index = flagged.value.indexOf(qId)
    if (index > -1) flagged.value.splice(index, 1)
    else flagged.value.push(qId)
  }

  async function saveDraftAnswers(qId, val) {
    answers.value[qId] = val

    try {
      isSaving.value = true
      isOffline.value = false

      const response = await saveDraft(qId, val)
      delete pendingDrafts.value[qId]
    } catch (error) {
      isOffline.value = true
      pendingDrafts.value[qId] = val
    } finally {
      isSaving.value = false
    }
  }

  async function flushPendingDrafts() {
    const pendingIds = Object.keys(pendingDrafts.value);
    if (pendingIds.length === 0) return;

    for (const questionId of pendingIds) {
      const answerId = this.pendingDrafts[questionId];
      await saveDraftAnswers(questionId, answerId);
    }
  }

  async function resumeSessionTest(test_id) {
    showLoading('Menyiapkan tes Anda...')

    try {
      const response = await postResumeSession(test_id, sessionToken.value)
      const data = response?.data

      if (!response?.status) {
        showError('Gagal memuat ulang sesi', response?.message)
        return false
      }

      currentTestData.value = data?.data
      currentTestId.value = test_id
      answers.value = data?.data?.drafts
      
      questions.value = data?.data?.questions || []

      setStoredData('kokai_current_test_id', test_id)
      setStoredData('kokai_current_test_data', currentTestData.value)

      await showSuccess('Tes Siap Dikerjakan!', `Instrumen ${testData?.data.test_name || ''} berhasil dimuat.`)

      return true
    } catch (error) {
      closeAlert()
      const message = error.response?.message || 'Sesi mungkin tidak valid.'

      await showError('Gagal Menyelesaikan Tes', message)
      throw error
    } finally {
      closeAlert()
    }
  }

  async function refreshSessionTest() {
    try {
      const response = await getResumeSession()
      const data = response?.data

      if (!response?.status) {
        showError('Gagal memuat ulang sesi', response?.message)
        return false
      }

      currentTestData.value = data?.data
      currentTestId.value = data?.data?.test_id
      answers.value = data?.data?.drafts
      
      questions.value = data?.data?.questions || []

      setStoredData('kokai_current_test_id', currentTestId.value)
      setStoredData('kokai_current_test_data', currentTestData.value)

      return true
    } catch (error) {
      closeAlert()
      const message = error.response?.message || 'Sesi mungkin tidak valid.'

      await showError('Gagal Menyelesaikan Tes', message)
      throw error
    } finally {

    }
  }

  async function stopSessionTest(test_id) {
    showLoading('Menyelesaikan tes Anda...')

    try {
      if (Object.keys(pendingDrafts).length > 0) {
        isSaving.value = true
        console.log('[Stop Session] Mengirim ulang draft tertunda sebelum stop...');
        await flushPendingDrafts();
      }

      const response = await stopSession(test_id, sessionToken.value)
      const data = response.data

      closeAlert()

      setStoredData('kokai_test_data', data?.data)
      tests.value = data?.data

      clearTestData()
      pendingDrafts.value = {}
      return true
    } catch (error) {
      closeAlert()
      const message = error.response?.message || 'Sesi mungkin tidak valid.'

      await showError('[Stop Session] Gagal mengakhiri sesi:', message)
      throw error
    }
    finally {
      closeAlert()
    }
  }

  async function clearSession() {
    try {
      const response = await logout()

      clearSessionData()
      clearTestData()

      Object.keys(localStorage)
        .filter((key) => key.startsWith('kokai_'))
        .forEach((key) => removeStoredData(key));
      return true
    } catch (error) {
      showError(error.response?.data?.message || 'Gagal logout. Coba lagi.')
      return false
    }
  }
  
  function clearSessionData() {
    isSessionActive.value = false
    sessionToken.value = null
    sessionData.value = null
    strSessionToken.value = null
    user.value = null
    tests.value = []

    removeStoredData('kokai_session_active')
    removeStoredData('kokai_session_token')
    removeStoredData('kokai_session_data')
    removeStoredData('kokai_user')
    removeStoredData('kokai_test_data')
  }

  function clearTestData() {
    currentTestId.value = null
    currentTestData.value = null
    currentQuestionIndex.value = 0
    answers.value = {}
    flagged.value = []

    removeStoredData('kokai_current_test_id')
    removeStoredData('kokai_current_test_data')
  }

  return {
    isSessionActive, sessionToken, sessionData, user, strSessionToken,
    mode, tests, currentTestId, currentTestData,
    questions,currentQuestionIndex, answers, flagged,
    totalTests, totalQuestions, answeredCount, currentQuestion, estimatedTime, 
    isSaving, isOffline, pendingDrafts,
    verifySessionToken, clearSession,
    startSessionTest, saveDraftAnswers, flushPendingDrafts, resumeSessionTest, refreshSessionTest, stopSessionTest, 
    setMode, nextQuestion, prevQuestion, goToQuestion, toggleFlag,
  }
})