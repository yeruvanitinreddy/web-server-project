import type { ExerciseType } from '@/types'

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(errorBody.error ?? 'Request failed.')
  }
  return response.json() as Promise<T>
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}

export async function fetchExerciseTypes(token: string): Promise<ExerciseType[]> {
  const response = await fetch(`${API_BASE}/exercise-types`, {
    headers: authHeaders(token),
  })
  return handleResponse<ExerciseType[]>(response)
}

export async function createExerciseType(token: string, name: string): Promise<ExerciseType> {
  const response = await fetch(`${API_BASE}/exercise-types`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  return handleResponse<ExerciseType>(response)
}

export async function updateExerciseType(
  token: string,
  exerciseType: ExerciseType
): Promise<ExerciseType> {
  const response = await fetch(`${API_BASE}/exercise-types/${exerciseType.id}`, {
    method: 'PUT',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(exerciseType),
  })
  return handleResponse<ExerciseType>(response)
}

export async function deleteExerciseType(token: string, id: number): Promise<ExerciseType> {
  const response = await fetch(`${API_BASE}/exercise-types/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  return handleResponse<ExerciseType>(response)
}
