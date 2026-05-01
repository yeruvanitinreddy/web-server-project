<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const notice = ref<string | null>(null)
const isSignup = ref(false)
const firstName = ref('')
const lastName = ref('')

async function submit() {
  error.value = null
  notice.value = null
  try {
    if (isSignup.value) {
      if (!firstName.value.trim() || !lastName.value.trim()) {
        error.value = 'Please enter your first and last name.'
        return
      }
      await auth.signup(
        email.value.trim(),
        password.value,
        firstName.value.trim(),
        lastName.value.trim()
      )
      router.push({ name: 'dashboard' })
    } else {
      await auth.login(email.value.trim(), password.value)
      router.push({ name: 'dashboard' })
    }
  } catch (e: any) {
    error.value = e.message ?? 'Login failed'
  }
}
</script>

<template>
  <section class="section">
    <div class="container" style="max-width: 480px;">
      <h1 class="title">Fitness Tracker</h1>
      <p class="subtitle">{{ isSignup ? 'Create your account' : 'Log in to continue' }}</p>

      <div class="box">
        <div v-if="error" class="notification is-danger is-light">{{ error }}</div>
        <div v-if="notice" class="notification is-info is-light">{{ notice }}</div>

        <div v-if="isSignup" class="columns">
          <div class="column">
            <label class="label">First name</label>
            <div class="control">
              <input v-model="firstName" class="input" placeholder="Jane" />
            </div>
          </div>
          <div class="column">
            <label class="label">Last name</label>
            <div class="control">
              <input v-model="lastName" class="input" placeholder="Doe" />
            </div>
          </div>
        </div>

        <div class="field">
          <label class="label">Email</label>
          <div class="control has-icons-left">
            <input v-model="email" class="input" placeholder="you@example.com" />
            <span class="icon is-left"><i class="fa-solid fa-user"></i></span>
          </div>
        </div>

        <div class="field">
          <label class="label">Password</label>
          <div class="control has-icons-left">
            <input v-model="password" type="password" class="input" placeholder="••••••••" />
            <span class="icon is-left"><i class="fa-solid fa-lock"></i></span>
          </div>
        </div>

        <div class="field">
          <button class="button is-link is-fullwidth" @click="submit">
            {{ isSignup ? 'Sign up' : 'Log in' }}
          </button>
        </div>

        <div class="has-text-centered">
          <button class="button is-text" @click="isSignup = !isSignup">
            {{ isSignup ? 'Already have an account? Log in' : 'Need an account? Sign up' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
