<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Role, UserProfile } from '@/types'
import { useAuthStore } from '@/stores/auth'
import { useUsersStore } from '@/stores/users'

const auth = useAuthStore()
const usersStore = useUsersStore()

const error = ref<string | null>(null)
const loading = ref(true)

const editingId = ref<string | null>(null)
const editDraft = ref<UserProfile | null>(null)

const roleOptions: Role[] = ['user', 'admin']

onMounted(async () => {
  try {
    await usersStore.loadUsers()
  } catch (e: any) {
    error.value = e.message ?? 'Failed to load users.'
  } finally {
    loading.value = false
  }
})

function startEdit(user: UserProfile) {
  editingId.value = user.id
  editDraft.value = JSON.parse(JSON.stringify(user))
}

function cancelEdit() {
  editingId.value = null
  editDraft.value = null
}

async function saveEdit() {
  if (!editDraft.value) return
  error.value = null

  try {
    await usersStore.updateUser(editDraft.value)
    if (auth.user?.id === editDraft.value.id) {
      await auth.loadSession()
    }
    cancelEdit()
  } catch (e: any) {
    error.value = e.message ?? 'Failed to update user.'
  }
}

async function removeUser(user: UserProfile) {
  const ok = confirm(
    `Delete ${user.firstName} ${user.lastName}? This removes the profile only; auth account and existing activity/friend data remain.`
  )
  if (!ok) return
  error.value = null

  try {
    await usersStore.deleteUser(user.id)
    if (auth.user?.id === user.id) {
      await auth.loadSession()
    }
  } catch (e: any) {
    error.value = e.message ?? 'Failed to delete user.'
  }
}
</script>

<template>
  <section class="section">
    <div class="container">
      <div class="level">
        <div class="level-left">
          <div>
            <h1 class="title">Admin: Users</h1>
            <p class="subtitle">Manage user profiles (names + roles).</p>
          </div>
        </div>
        <div class="level-right">
          <RouterLink class="button" to="/">Back</RouterLink>
        </div>
      </div>

      <div v-if="error" class="notification is-danger is-light">{{ error }}</div>

      <div v-if="loading" class="notification is-info is-light">Loading users...</div>

      <div v-else class="table-container">
        <table class="table is-fullwidth is-striped is-hoverable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th style="width: 200px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in usersStore.users" :key="user.id">
              <td v-if="editingId !== user.id">
                {{ user.firstName }} {{ user.lastName }}
              </td>
              <td v-else>
                <div class="columns is-mobile">
                  <div class="column">
                    <input v-model="editDraft!.firstName" class="input is-small" />
                  </div>
                  <div class="column">
                    <input v-model="editDraft!.lastName" class="input is-small" />
                  </div>
                </div>
              </td>

              <td>{{ user.email ?? '—' }}</td>

              <td v-if="editingId !== user.id">{{ user.role }}</td>
              <td v-else>
                <div class="select is-small">
                  <select v-model="editDraft!.role">
                    <option v-for="role in roleOptions" :key="role" :value="role">
                      {{ role }}
                    </option>
                  </select>
                </div>
              </td>

              <td>
                <div class="buttons are-small">
                  <button
                    v-if="editingId !== user.id"
                    class="button is-info"
                    @click="startEdit(user)"
                  >
                    Edit
                  </button>
                  <button v-else class="button is-success" @click="saveEdit">Save</button>
                  <button v-if="editingId === user.id" class="button" @click="cancelEdit">
                    Cancel
                  </button>
                  <button
                    v-if="editingId !== user.id"
                    class="button is-danger"
                    @click="removeUser(user)"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
