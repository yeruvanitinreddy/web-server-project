import type { User } from '@/types'
import { API_BASE, authHeaders, handleResponse } from './client'

export async function fetchUsers(token: string): Promise<User[]> {
  const response = await fetch(`${API_BASE}/users`, {
    headers: authHeaders(token),
  })
  return handleResponse<User[]>(response)
}

export async function createUser(token: string, user: Omit<User, 'id'>): Promise<User> {
  const response = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  })
  return handleResponse<User>(response)
}

export async function updateUser(token: string, user: User): Promise<User> {
  const response = await fetch(`${API_BASE}/users/${user.id}`, {
    method: 'PUT',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  })
  return handleResponse<User>(response)
}

export async function deleteUser(token: string, id: number): Promise<User> {
  const response = await fetch(`${API_BASE}/users/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  return handleResponse<User>(response)
}
