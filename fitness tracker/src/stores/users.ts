import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserProfile } from '@/types'
import { seedUsers } from '@/data/seed'

export const useUsersStore = defineStore('users', () => {
  const users = ref<UserProfile[]>(structuredClone(seedUsers))

  function addUser(user: Omit<UserProfile, 'id'> & { id?: string }) {
    const nextId = String(
      Math.max(...users.value.map(u => Number.parseInt(u.id, 10)), 0) + 1
    )
    users.value.push({ ...user, id: user.id ?? nextId })
  }

  function updateUser(updated: UserProfile) {
    users.value = users.value.map(u => (u.id === updated.id ? updated : u))
  }

  function deleteUser(userId: string) {
    users.value = users.value.filter(u => u.id !== userId)
  }

  return { users, addUser, updateUser, deleteUser }
})
