<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">
        Welcome, {{ auth.currentUser?.firstName }} {{ auth.currentUser?.lastName }}
      </h1>
      <p class="subtitle">Role: {{ auth.currentUser?.role }}</p>

      <div class="buttons">
        <RouterLink class="button is-link" to="/activities">My Activities</RouterLink>
        <RouterLink class="button is-info" to="/friends">Friends Feed</RouterLink>
        <RouterLink v-if="auth.isAdmin" class="button is-warning" to="/admin/users">Admin Users</RouterLink>
        <RouterLink v-if="auth.isAdmin" class="button is-warning" to="/admin/exercise-types">
          Admin Exercise Types
        </RouterLink>
        <button class="button" @click="auth.logout()">Logout</button>
      </div>
    </div>
  </section>
</template>
