import api from './axios'

export const verifyTokenRequest = (token) => {
  return api.post('/verify-token', { token });
}

export const logout = () => {
	return api.post('/logout');
}

export const getTests = () => {
  return api.get('/get-tests');
}

export const startSession = (session_test_id, token) => {
  return api.post('/start-session', { session_test_id, token });
}

export const saveDraft = (question_id, answer_id) => { 
  return api.post('/save-draft', { question_id, answer_id });
}

export const stopSession = (session_test_id, token) => { 
  return api.post('/stop-session', { session_test_id, token });
}

export const postResumeSession = (session_test_id) => {
  return api.post('/resume-session', { session_test_id });
}

export const getResumeSession = () => {
  return api.get('/resume-session');
}