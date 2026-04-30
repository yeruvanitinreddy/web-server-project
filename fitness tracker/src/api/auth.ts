import type { User } from '@/types'
import { API_BASE, handleResponse } from './client'

export async function login(username: string, password: string): Promise<{ token: string; user: User }> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  return handleResponse<{ token: string; user: User }>(response)
}
