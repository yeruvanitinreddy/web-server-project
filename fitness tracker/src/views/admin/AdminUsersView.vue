<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { User } from '@/types'
import { useUsersStore } from '@/stores/users'

const usersStore = useUsersStore()

const loading = ref(false)
const error = ref<string | null>(null)

const newUser = ref({
  firstName: '',
  lastName: '',
  username: '',
  password: '',
  role: 'user',
})

const editingId = ref<number | null>(null)
const editDraft = ref<User | null>(null)

async function loadUsers() {
  error.value = null
  loading.value = true
  try {
    await usersStore.loadUsers()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load users.'
  } finally {
    loading.value = false
  }
}

onMounted(loadUsers)

function resetForm() {
  newUser.value = { firstName: '', lastName: '', username: '', password: '', role: 'user' }
}

async function addUser() {
  error.value = null

  if (!newUser.value.firstName || !newUser.value.lastName || !newUser.value.username || !newUser.value.password) {
    error.value = 'Please fill in all user fields.'
    return
  }

  try {
    await usersStore.addUser({
      firstName: newUser.value.firstName.trim(),
      lastName: newUser.value.lastName.trim(),
      username: newUser.value.username.trim(),
      password: newUser.value.password,
      role: newUser.value.role as User['role'],
    })
    resetForm()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to add user.'
  }
}

function startEdit(user: User) {
  editingId.value = user.id
  editDraft.value = { ...user }
}

function cancelEdit() {
  editingId.value = null
  editDraft.value = null
}

async function saveEdit() {
  if (!editDraft.value) return

  error.value = null
  try {
    const { password, ...rest } = editDraft.value
    const trimmedPassword = password?.trim()
    const payload: User = trimmedPassword ? { ...rest, password: trimmedPassword } : (rest as User)
    await usersStore.updateUser(payload)
    cancelEdit()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update user.'
  }
}

async function removeUser(id: number) {
  const ok = confirm('Delete this user?')
  if (!ok) return

  error.value = null
  try {
    await usersStore.deleteUser(id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete user.'
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
            <p class="subtitle">Manage user accounts.</p>
          </div>
        </div>
        <div class="level-right">
          <RouterLink class="button" to="/">Back</RouterLink>
        </div>
      </div>

      <div v-if="error" class="notification is-danger is-light">{{ error }}</div>
      <div v-if="loading" class="notification is-info is-light">Loading users...</div>

      <div class="box">
        <h2 class="title is-5">Add User</h2>
        <div class="columns is-multiline">
          <div class="column is-3">
            <label class="label">First Name</label>
            <input v-model="newUser.firstName" class="input" placeholder="First name" />
          </div>
          <div class="column is-3">
            <label class="label">Last Name</label>
            <input v-model="newUser.lastName" class="input" placeholder="Last name" />
          </div>
          <div class="column is-3">
            <label class="label">Username</label>
            <input v-model="newUser.username" class="input" placeholder="Username" />
          </div>
          <div class="column is-3">
            <label class="label">Password</label>
            <input v-model="newUser.password" type="password" class="input" placeholder="Password" />
          </div>
          <div class="column is-3">
            <label class="label">Role</label>
            <div class="select is-fullwidth">
              <select v-model="newUser.role">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div class="column is-12">
            <button class="button is-link" @click="addUser">
              <span class="icon"><i class="fa-solid fa-plus"></i></span>
              <span>Add User</span>
            </button>
          </div>
        </div>
      </div>

      <div class="box">
        <h2 class="title is-5">User List</h2>
        <div v-if="usersStore.users.length === 0" class="notification is-info is-light">
          No users available.
        </div>
        <div v-else class="table-container">
          <table class="table is-fullwidth is-striped is-hoverable">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th style="width: 220px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in usersStore.users" :key="user.id">
                <td v-if="editingId !== user.id">{{ user.firstName }} {{ user.lastName }}</td>
                <td v-else>
                  <div class="field has-addons">
                    <input v-model="editDraft!.firstName" class="input is-small" placeholder="First" />
                    <input v-model="editDraft!.lastName" class="input is-small" placeholder="Last" />
                  </div>
                </td>

                <td v-if="editingId !== user.id">{{ user.username }}</td>
                <td v-else>
                  <input v-model="editDraft!.username" class="input is-small" />
                </td>

                <td v-if="editingId !== user.id">{{ user.role }}</td>
                <td v-else>
                  <div class="select is-small">
                    <select v-model="editDraft!.role">
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
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
                      <span class="icon"><i class="fa-solid fa-pen"></i></span>
                      <span>Edit</span>
                    </button>

                    <button
                      v-else
                      class="button is-success"
                      @click="saveEdit"
                    >
                      <span class="icon"><i class="fa-solid fa-check"></i></span>
                      <span>Save</span>
                    </button>

                    <button v-if="editingId === user.id" class="button" @click="cancelEdit">
                      Cancel
                    </button>

                    <button
                      v-if="editingId === user.id"
                      class="button is-warning"
                      @click="editDraft!.password = ''"
                    >
                      Clear Password
                    </button>

                    <button
                      v-if="editingId !== user.id"
                      class="button is-danger"
                      @click="removeUser(user.id)"
                    >
                      <span class="icon"><i class="fa-solid fa-trash"></i></span>
                      <span>Delete</span>
                    </button>
                  </div>
                  <div v-if="editingId === user.id" class="field mt-2">
                    <label class="label is-small" :for="`edit-password-${user.id}`">
                      Reset Password (optional)
                    </label>
                    <input
                      :id="`edit-password-${user.id}`"
                      v-model="editDraft!.password"
                      type="password"
                      class="input is-small"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>
