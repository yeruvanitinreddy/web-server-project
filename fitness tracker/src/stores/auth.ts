import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useUsersStore } from './users'

const STORAGE_KEY = 'fitnessTracker.currentUserId'

export const useAuthStore = defineStore('auth', () => {
  // initialize from localStorage so refresh keeps you logged in
  const currentUserId = ref<number | null>(
    (() => {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      const n = Number(raw)
      return Number.isFinite(n) ? n : null
    })()
  )

  const usersStore = useUsersStore()

  const currentUser = computed(() =>
    usersStore.users.find(u => u.id === currentUserId.value) ?? null
  )

  const isAuthenticated = computed(() => currentUser.value !== null)
  const isAdmin = computed(() => currentUser.value?.role === 'admin')

  function login(username: string, password: string) {
    const user = usersStore.users.find(
      u => u.username === username && u.password === password
    )
    if (!user) return false
    currentUserId.value = user.id
    return true
  }

  function logout() {
    currentUserId.value = null
  }

  // keep localStorage in sync
  watch(
    currentUserId,
    (val) => {
      if (val === null) localStorage.removeItem(STORAGE_KEY)
      else localStorage.setItem(STORAGE_KEY, String(val))
    },
    { immediate: true }
  )

  return { currentUserId, currentUser, isAuthenticated, isAdmin, login, logout }
})