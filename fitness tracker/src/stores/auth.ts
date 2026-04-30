import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { User } from '@/types'
import { login as loginRequest } from '@/api/auth'

const TOKEN_KEY = 'fitnessTracker.token'
const USER_KEY = 'fitnessTracker.currentUser'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const currentUser = ref<User | null>(
    (() => {
      const raw = localStorage.getItem(USER_KEY)
      if (!raw) return null
      try {
        return JSON.parse(raw) as User
      } catch {
        return null
      }
    })()
  )

  const isAuthenticated = computed(() => Boolean(token.value))
  const isAdmin = computed(() => currentUser.value?.role === 'admin')

  async function login(username: string, password: string) {
    const result = await loginRequest(username, password)
    token.value = result.token
    currentUser.value = result.user
    return true
  }

  function logout() {
    token.value = null
    currentUser.value = null
  }

  watch(
    token,
    (val) => {
      if (val) localStorage.setItem(TOKEN_KEY, val)
      else localStorage.removeItem(TOKEN_KEY)
    },
    { immediate: true }
  )

  watch(
    currentUser,
    (val) => {
      if (val) localStorage.setItem(USER_KEY, JSON.stringify(val))
      else localStorage.removeItem(USER_KEY)
    },
    { immediate: true }
  )

  return { token, currentUser, isAuthenticated, isAdmin, login, logout }
})
