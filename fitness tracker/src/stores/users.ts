import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types'
import { seedUsers } from '@/data/seed'

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>(structuredClone(seedUsers))

  function addUser(user: Omit<User, 'id'>) {
    const nextId = Math.max(...users.value.map(u => u.id), 0) + 1
    users.value.push({ ...user, id: nextId })
  }

  function updateUser(updated: User) {
    users.value = users.value.map(u => (u.id === updated.id ? updated : u))
  }

  function deleteUser(userId: number) {
    users.value = users.value.filter(u => u.id !== userId)
  }

  return { users, addUser, updateUser, deleteUser }
})