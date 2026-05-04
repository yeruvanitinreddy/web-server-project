import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserProfile } from '@/types'
import { mapProfile, type ProfileRow } from '@/lib/profiles'
import { supabase } from '@/lib/supabase'

export const useUsersStore = defineStore('users', () => {
  const users = ref<UserProfile[]>([])

  async function loadUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, role')
      .order('last_name', { ascending: true })
      .order('first_name', { ascending: true })

    if (error) throw error
    users.value = (data ?? []).map((row) => mapProfile(row as ProfileRow))
  }

  async function updateUser(updated: UserProfile) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        first_name: updated.firstName,
        last_name: updated.lastName,
        role: updated.role,
      })
      .eq('id', updated.id)
      .select('id, email, first_name, last_name, role')
      .single()

    if (error) throw error
    users.value = users.value.map(u => (u.id === updated.id ? mapProfile(data as ProfileRow) : u))
  }

  async function deleteUser(userId: string) {
    const { error } = await supabase.from('profiles').delete().eq('id', userId)
    if (error) throw error
    users.value = users.value.filter(u => u.id !== userId)
  }

  return { users, loadUsers, updateUser, deleteUser }
})
