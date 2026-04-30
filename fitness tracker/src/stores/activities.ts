import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Activity, ActivityType } from '@/types'
import { useAuthStore } from './auth'
import { supabase } from '@/lib/supabase'

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

  async function loadMyActivities() {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('Activity')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (error) throw error
    activities.value = (data ?? []).map(mapRow)
  }

  async function addActivity(activity: { type: ActivityType; minutes: number; date: string; notes?: string }) {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('Activity')
      .insert({
        user_id: user.id,
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
    const { data, error } = await supabase
      .from('Activity')
      .update({
        type: updated.type,
        duration: updated.minutes,
        date: updated.date,
        notes: updated.notes,
      })
      .eq('id', updated.id)
      .select()
      .single()

    if (error) throw error
    activities.value = activities.value.map(a => (a.id === updated.id ? mapRow(data) : a))
  }

  async function deleteActivity(id: number) {
    const { error } = await supabase.from('Activity').delete().eq('id', id)
    if (error) throw error
    activities.value = activities.value.filter(a => a.id !== id)
  }

  return { activities, myActivities, loadMyActivities, addActivity, updateActivity, deleteActivity }
})