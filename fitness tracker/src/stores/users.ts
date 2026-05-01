import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Role, UserProfile } from '@/types'
import { supabase } from '@/lib/supabase'

export const useUsersStore = defineStore('users', () => {
  const users = ref<UserProfile[]>([])

  function mapProfile(row: {
    id: string
    email: string | null
    first_name: string
    last_name: string
    role: Role
  }): UserProfile {
    return {
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      role: row.role,
    }
  }

  async function loadUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, role')
      .order('last_name', { ascending: true })
      .order('first_name', { ascending: true })

    if (error) throw error
    users.value = (data ?? []).map(mapProfile)
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
    users.value = users.value.map(u => (u.id === updated.id ? mapProfile(data) : u))
  }

  async function deleteUser(userId: string) {
    const { error } = await supabase.from('profiles').delete().eq('id', userId)
    if (error) throw error
    users.value = users.value.filter(u => u.id !== userId)
  }

  return { users, loadUsers, updateUser, deleteUser }
})
