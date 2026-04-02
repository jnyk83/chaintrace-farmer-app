import { getIdToken } from './firebase'
import { API_BASE_URL } from '@/constants/config'

const REQUEST_TIMEOUT = 10000 // 10s timeout

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getIdToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    return res
  } finally {
    clearTimeout(timeout)
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`)
  return data as T
}

export const api = {
  async get<T>(path: string): Promise<T> {
    const headers = await authHeaders()
    const res = await fetchWithTimeout(`${API_BASE_URL}${path}`, { headers })
    return handleResponse<T>(res)
  },

  async post<T>(path: string, body: Record<string, unknown> = {}): Promise<T> {
    const headers = await authHeaders()
    const res = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
    return handleResponse<T>(res)
  },
}
