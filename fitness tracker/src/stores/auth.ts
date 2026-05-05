import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { UserProfile } from '@/types'
import { mapProfile, type ProfileRow } from '@/lib/profiles'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<{ id: string; email: string | null } | null>(null)
  const profile = ref<UserProfile | null>(null)
  const initialized = ref(false)

  const isAuthenticated = computed(() => user.value !== null)
  const isAdmin = computed(() => profile.value?.role === 'admin')
  const currentUser = computed(() => profile.value)

  async function loadProfile(userId: string, email: string | null) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, role')
      .eq('id', userId)
      .maybeSingle()

    if (error) throw error
    if (data) {
      profile.value = mapProfile(data as ProfileRow)
      return
    }

    const { data: created, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        first_name: '',
        last_name: '',
        role: 'user',
      })
      .select('id, email, first_name, last_name, role')
      .single()

    if (createError) throw createError
    profile.value = mapProfile(created as ProfileRow)
  }

  async function loadSession() {
    const { data } = await supabase.auth.getUser()
    user.value = data.user ? { id: data.user.id, email: data.user.email ?? null } : null
    if (user.value) {
      await loadProfile(user.value.id, user.value.email)
    } else {
      profile.value = null
    }
    initialized.value = true
  }

  async function initialize() {
  if (initialized.value) return
  try {
    await loadSession()
  } catch (error) {
    console.error('Auth initialization failed:', error)
    user.value = null
    profile.value = null
    initialized.value = true
  }
}

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    await loadSession()
  }

  async function signup(email: string, password: string, firstName: string, lastName: string) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error

    if (!data.user) {
      return { needsConfirmation: true }
    }

    const { data: created, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        role: 'user',
      })
      .select('id, email, first_name, last_name, role')
      .single()

    if (createError) throw createError
    profile.value = mapProfile(created as ProfileRow)
    user.value = { id: data.user.id, email }
    initialized.value = true
    return { needsConfirmation: false }
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
  }

  return {
    user,
    profile,
    currentUser,
    initialized,
    isAuthenticated,
    isAdmin,
    initialize,
    loadSession,
    login,
    signup,
    logout,
  }
})
