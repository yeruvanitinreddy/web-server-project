import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Activity, ActivityType } from '@/types'
import { createActivity, deleteActivity, fetchActivities, updateActivity } from '@/api/activities'
import { useAuthStore } from './auth'

export const activityTypeLabels: Record<string, string> = {
  run: 'Run',
  walk: 'Walk',
  bike: 'Bike',
  strength_training: 'Strength Training',
  dance: 'Dance',
}

export const useActivitiesStore = defineStore('activities', () => {
  const activities = ref<Activity[]>([])
  const auth = useAuthStore()

  const myActivities = computed(() => {
    const me = auth.currentUser
    if (!me) return []
    return activities.value
      .filter(a => a.userId === me.id)
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
  })

  async function loadActivities() {
    if (!auth.token) {
      activities.value = []
      return
    }
    activities.value = await fetchActivities(auth.token)
  }

  async function addActivity(activity: { type: ActivityType; minutes: number; date: string; notes?: string }) {
    if (!auth.token) throw new Error('Not authenticated')
    const created = await createActivity(auth.token, activity)
    activities.value.push(created)
  }

  async function updateActivityRecord(updated: Activity) {
    if (!auth.token) throw new Error('Not authenticated')
    const saved = await updateActivity(auth.token, updated)
    activities.value = activities.value.map(a => (a.id === saved.id ? saved : a))
  }

  async function deleteActivityRecord(id: number) {
    if (!auth.token) throw new Error('Not authenticated')
    await deleteActivity(auth.token, id)
    activities.value = activities.value.filter(a => a.id !== id)
  }

  return {
    activities,
    myActivities,
    loadActivities,
    addActivity,
    updateActivity: updateActivityRecord,
    deleteActivity: deleteActivityRecord,
  }
})
