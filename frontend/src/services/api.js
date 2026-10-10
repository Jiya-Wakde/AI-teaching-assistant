import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export async function explainError(payload) {
  const { data } = await api.post('/explain-error', payload)
  return data
}

export async function mentorCode(payload) {
  const { data } = await api.post('/mentor', payload)
  return data
}

export async function guidedFix(payload) {
  const { data } = await api.post('/guided-fix', payload)
  return data
}
