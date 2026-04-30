import type { Activity, ActivityType } from '@/types'
import { API_BASE, authHeaders, handleResponse } from './client'

export async function fetchActivities(token: string): Promise<Activity[]> {
  const response = await fetch(`${API_BASE}/activities`, {
    headers: authHeaders(token),
  })
  return handleResponse<Activity[]>(response)
}

export async function createActivity(
  token: string,
  activity: { type: ActivityType; minutes: number; date: string; notes?: string }
): Promise<Activity> {
  const response = await fetch(`${API_BASE}/activities`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(activity),
  })
  return handleResponse<Activity>(response)
}

export async function updateActivity(token: string, activity: Activity): Promise<Activity> {
  const response = await fetch(`${API_BASE}/activities/${activity.id}`, {
    method: 'PUT',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(activity),
  })
  return handleResponse<Activity>(response)
}

export async function deleteActivity(token: string, id: number): Promise<Activity> {
  const response = await fetch(`${API_BASE}/activities/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  return handleResponse<Activity>(response)
}
