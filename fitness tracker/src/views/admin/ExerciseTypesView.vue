<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { ExerciseType } from '@/types'
import { useAuthStore } from '@/stores/auth'
import {
  createExerciseType,
  deleteExerciseType,
  fetchExerciseTypes,
  updateExerciseType,
} from '@/api/exerciseTypes'

const auth = useAuthStore()

const exerciseTypes = ref<ExerciseType[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const newName = ref('')
const editingId = ref<number | null>(null)
const editDraft = ref<ExerciseType | null>(null)

async function loadExerciseTypes() {
  error.value = null
  loading.value = true
  try {
    if (!auth.token) throw new Error('Not authenticated')
    exerciseTypes.value = await fetchExerciseTypes(auth.token)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load exercise types.'
  } finally {
    loading.value = false
  }
}

onMounted(loadExerciseTypes)

async function addExerciseType() {
  error.value = null
  if (!newName.value.trim()) {
    error.value = 'Please provide an exercise type name.'
    return
  }

  try {
    if (!auth.token) throw new Error('Not authenticated')
    const created = await createExerciseType(auth.token, newName.value.trim())
    exerciseTypes.value.push(created)
    newName.value = ''
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to add exercise type.'
  }
}

function startEdit(type: ExerciseType) {
  editingId.value = type.id
  editDraft.value = { ...type }
}

function cancelEdit() {
  editingId.value = null
  editDraft.value = null
}

async function saveEdit() {
  if (!editDraft.value) return
  error.value = null
  try {
    if (!auth.token) throw new Error('Not authenticated')
    const saved = await updateExerciseType(auth.token, editDraft.value)
    exerciseTypes.value = exerciseTypes.value.map((t) => (t.id === saved.id ? saved : t))
    cancelEdit()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update exercise type.'
  }
}

async function removeExerciseType(id: number) {
  const ok = confirm('Delete this exercise type?')
  if (!ok) return

  error.value = null
  try {
    if (!auth.token) throw new Error('Not authenticated')
    await deleteExerciseType(auth.token, id)
    exerciseTypes.value = exerciseTypes.value.filter((t) => t.id !== id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete exercise type.'
  }
}
</script>

<template>
  <section class="section">
    <div class="container">
      <div class="level">
        <div class="level-left">
          <div>
            <h1 class="title">Admin: Exercise Types</h1>
            <p class="subtitle">Manage workout types available in the app.</p>
          </div>
        </div>
        <div class="level-right">
          <RouterLink class="button" to="/">Back</RouterLink>
        </div>
      </div>

      <div v-if="error" class="notification is-danger is-light">{{ error }}</div>
      <div v-if="loading" class="notification is-info is-light">Loading exercise types...</div>

      <div class="box">
        <h2 class="title is-5">Add Exercise Type</h2>
        <div class="field has-addons">
          <div class="control is-expanded">
            <input v-model="newName" class="input" placeholder="New exercise type" />
          </div>
          <div class="control">
            <button class="button is-link" @click="addExerciseType">
              <span class="icon"><i class="fa-solid fa-plus"></i></span>
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>

      <div class="box">
        <h2 class="title is-5">Exercise Types</h2>
        <div v-if="exerciseTypes.length === 0" class="notification is-info is-light">
          No exercise types available.
        </div>
        <div v-else class="table-container">
          <table class="table is-fullwidth is-striped is-hoverable">
            <thead>
              <tr>
                <th>Name</th>
                <th style="width: 200px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="type in exerciseTypes" :key="type.id">
                <td v-if="editingId !== type.id">{{ type.name }}</td>
                <td v-else>
                  <input v-model="editDraft!.name" class="input is-small" />
                </td>
                <td>
                  <div class="buttons are-small">
                    <button
                      v-if="editingId !== type.id"
                      class="button is-info"
                      @click="startEdit(type)"
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
                    <button v-if="editingId === type.id" class="button" @click="cancelEdit">
                      Cancel
                    </button>
                    <button
                      v-if="editingId !== type.id"
                      class="button is-danger"
                      @click="removeExerciseType(type.id)"
                    >
                      <span class="icon"><i class="fa-solid fa-trash"></i></span>
                      <span>Delete</span>
                    </button>
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
