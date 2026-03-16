<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const error = ref<string | null>(null)

function submit() {
  error.value = null
  const ok = auth.login(username.value.trim(), password.value)
  if (!ok) {
    error.value = 'Invalid username or password'
    return
  }
  router.push({ name: 'dashboard' })
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
          <label class="label">Username</label>
          <div class="control has-icons-left">
            <input v-model="username" class="input" placeholder="admin / nitin / hemanth / pablo" />
            <span class="icon is-left"><i class="fa-solid fa-user"></i></span>
          </div>
        </div>

        <div class="field">
          <label class="label">Password</label>
          <div class="control has-icons-left">
            <input v-model="password" type="password" class="input" placeholder="admin / password" />
            <span class="icon is-left"><i class="fa-solid fa-lock"></i></span>
          </div>
        </div>

        <div class="field">
          <button class="button is-link is-fullwidth" @click="submit">Log in</button>
        </div>
      </div>

      <div class="content is-small">
        <p><strong>Seed accounts:</strong></p>
        <ul>
          <li>admin / admin (admin)</li>
          <li>nitin / password (user)</li>
          <li>hemanth / password (user)</li>
          <li>pablo / password (user)</li>
        </ul>
      </div>
    </div>
  </section>
</template>