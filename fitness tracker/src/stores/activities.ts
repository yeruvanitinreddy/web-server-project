import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Activity, ActivityType } from '@/types'
import { seedActivities } from '@/data/seed'
import { useAuthStore } from './auth'

export const activityTypeLabels: Record<ActivityType, string> = {
  run: 'Run',
  walk: 'Walk',
  bike: 'Bike',
  strength_training: 'Strength Training',
  dance: 'Dance',
}

export const useActivitiesStore = defineStore('activities', () => {
  const activities = ref<Activity[]>(JSON.parse(JSON.stringify(seedActivities)))
  const auth = useAuthStore()

  const myActivities = computed(() => {
    const me = auth.currentUser
    if (!me) return []
    return activities.value
      .filter(a => a.userId === me.id)
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
  })

  function addActivity(activity: { type: ActivityType; minutes: number; date: string; notes?: string }) {
    const me = auth.currentUser
    if (!me) throw new Error('Not authenticated')

    const nextId = Math.max(...activities.value.map(a => a.id), 0) + 1
    activities.value.push({
      id: nextId,
      userId: me.id,
      ...activity,
    })
  }

  function updateActivity(updated: Activity) {
    activities.value = activities.value.map(a => (a.id === updated.id ? updated : a))
  }

  function deleteActivity(id: number) {
    activities.value = activities.value.filter(a => a.id !== id)
  }

  return { activities, myActivities, addActivity, updateActivity, deleteActivity }
})