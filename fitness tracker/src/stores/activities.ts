import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Activity, ActivityType } from '@/types'
import { useAuthStore } from './auth'
import { supabase } from '@/lib/supabase'

export const useActivitiesStore = defineStore('activities', () => {
  const activities = ref<Activity[]>([])
  const activityTypeOptions = ref<{ value: ActivityType; label: string }[]>([])
  const auth = useAuthStore()

  const myActivities = computed(() => {
    const me = auth.currentUser
    if (!me) return []
    return activities.value
      .filter(a => a.userId === me.id)
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
  })

  const activityTypeLabels = computed(
    () =>
      Object.fromEntries(
        activityTypeOptions.value.map((option) => [option.value, option.label])
      ) as Record<ActivityType, string>
  )

  function formatActivityType(type: string) {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  function getActivityTypeLabel(type: ActivityType) {
    return activityTypeLabels.value[type] ?? formatActivityType(type)
  }

  function mapRow(row: any): Activity {
    return {
      id: row.id,
      userId: row.user_id,
      type: row.type as ActivityType,
      minutes: row.duration,
      date: row.date,
      notes: row.notes ?? undefined,
    }
  }

  function normalizeType(name: string): ActivityType {
    const key = name.toLowerCase().replace(/\s+/g, '_')
    return key as ActivityType
  }

  async function loadActivityTypes() {
    const { data, error } = await supabase.from('ExerciseTypes').select('name').order('name')
    if (error) throw error

    activityTypeOptions.value = (data ?? []).map((row: { name: string }) => ({
      value: normalizeType(row.name),
      label: row.name,
    }))
  }

  async function requireUserId() {
    const currentId = auth.user?.id
    if (currentId) return currentId
    const { data } = await supabase.auth.getUser()
    if (!data.user) throw new Error('Not authenticated')
    return data.user.id
  }

  async function loadMyActivities() {
    const userId = await requireUserId()

    const { data, error } = await supabase
      .from('Activity')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) throw error
    activities.value = (data ?? []).map(mapRow)
  }

  async function addActivity(activity: { type: ActivityType; minutes: number; date: string; notes?: string }) {
    const userId = await requireUserId()

    const { data, error } = await supabase
      .from('Activity')
      .insert({
        user_id: userId,
        type: activity.type,
        duration: activity.minutes,
        date: activity.date,
        notes: activity.notes,
      })
      .select()
      .single()

    if (error) throw error
    activities.value.unshift(mapRow(data))
  }

  async function updateActivity(updated: Activity) {
    const userId = await requireUserId()

    const { data, error } = await supabase
      .from('Activity')
      .update({
        type: updated.type,
        duration: updated.minutes,
        date: updated.date,
        notes: updated.notes,
      })
      .eq('id', updated.id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    activities.value = activities.value.map(a => (a.id === updated.id ? mapRow(data) : a))
  }

  async function deleteActivity(id: number) {
    const userId = await requireUserId()
    const { error } = await supabase.from('Activity').delete().eq('id', id).eq('user_id', userId)
    if (error) throw error
    activities.value = activities.value.filter(a => a.id !== id)
  }

  return {
    activities,
    activityTypeOptions,
    activityTypeLabels,
    getActivityTypeLabel,
    myActivities,
    requireUserId,
    loadActivityTypes,
    loadMyActivities,
    addActivity,
    updateActivity,
    deleteActivity,
  }
})
