<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref<string | null>(null)

async function submit() {
  error.value = null
  try {
    await auth.login(email.value.trim(), password.value)
    router.push({ name: 'dashboard' })
  } catch (e: any) {
    error.value = e.message ?? 'Login failed'
  }
}
</script>

<template>
  <section class="section">
    <div class="container" style="max-width: 480px;">
      <h1 class="title">Fitness Tracker</h1>
      <p class="subtitle">Log in to continue</p>

      <div class="box">
        <div v-if="error" class="notification is-danger is-light">{{ error }}</div>

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
          <button class="button is-link is-fullwidth" @click="submit">Log in</button>
        </div>
      </div>
    </div>
  </section>
</template>