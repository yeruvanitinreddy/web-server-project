import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<{ id: string; email: string | null } | null>(null)

  const isAuthenticated = computed(() => user.value !== null)
  const isAdmin = computed(() => false) // adjust if you add roles later

  async function loadSession() {
    const { data } = await supabase.auth.getUser()
    user.value = data.user ? { id: data.user.id, email: data.user.email } : null
  }

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    await loadSession()
  }

  async function signup(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    await loadSession()
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
  }

  return { user, isAuthenticated, isAdmin, loadSession, login, signup, logout }
})