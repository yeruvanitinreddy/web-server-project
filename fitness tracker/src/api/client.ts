export const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')

export async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(errorBody.error ?? 'Request failed.')
  }
  return response.json() as Promise<T>
}

export function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}
