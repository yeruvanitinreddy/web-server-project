import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types'
import { createUser, deleteUser, fetchUsers, updateUser } from '@/api/users'
import { useAuthStore } from './auth'

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const auth = useAuthStore()

  async function loadUsers() {
    if (!auth.token) {
      users.value = []
      return
    }
    users.value = await fetchUsers(auth.token)
  }

  async function addUser(user: Omit<User, 'id'>) {
    if (!auth.token) throw new Error('Not authenticated')
    const created = await createUser(auth.token, user)
    users.value.push(created)
  }

  async function updateUserRecord(updated: User) {
    if (!auth.token) throw new Error('Not authenticated')
    const saved = await updateUser(auth.token, updated)
    users.value = users.value.map(u => (u.id === saved.id ? saved : u))
  }

  async function deleteUserRecord(userId: number) {
    if (!auth.token) throw new Error('Not authenticated')
    await deleteUser(auth.token, userId)
    users.value = users.value.filter(u => u.id !== userId)
  }

  return { users, loadUsers, addUser, updateUser: updateUserRecord, deleteUser: deleteUserRecord }
})
