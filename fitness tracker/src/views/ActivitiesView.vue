<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { Activity, ActivityType, ExerciseType } from '@/types'
import { useActivitiesStore } from '@/stores/activities'
import { useAuthStore } from '@/stores/auth'
import { fetchExerciseTypes } from '@/api/exerciseTypes'

const activitiesStore = useActivitiesStore()
const auth = useAuthStore()

const type = ref<ActivityType>('run')
const minutes = ref<number>(30)
const date = ref<string>(new Date().toISOString().slice(0, 10))
const notes = ref<string>('')

const error = ref<string | null>(null)
const loading = ref(false)

const activityTypeOptions = ref<{ value: ActivityType; label: string }[]>([])

function normalizeType(name: string): ActivityType {
  const key = name.toLowerCase().replace(/\s+/g, '_')
  return key as ActivityType
}

async function loadData() {
  error.value = null
  loading.value = true

  try {
    await activitiesStore.loadActivities()
    if (!auth.token) throw new Error('Not authenticated')

    const types = await fetchExerciseTypes(auth.token)
    activityTypeOptions.value = (types ?? []).map((row: ExerciseType) => ({
      value: normalizeType(row.name),
      label: row.name,
    }))

    if (!activityTypeOptions.value.find((o) => o.value === type.value)) {
      type.value = activityTypeOptions.value[0]?.value ?? 'run'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load activities.'
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

const activityTypeLabelByValue = computed(
  () =>
    Object.fromEntries(activityTypeOptions.value.map((o) => [o.value, o.label])) as Record<
      ActivityType,
      string
    >
)

const editingId = ref<number | null>(null)
const editDraft = ref<Activity | null>(null)

function resetForm() {
  type.value = 'run'
  minutes.value = 30
  date.value = new Date().toISOString().slice(0, 10)
  notes.value = ''
}

async function add() {
  error.value = null

  if (!date.value) {
    error.value = 'Please choose a date.'
    return
  }
  if (!Number.isFinite(minutes.value) || minutes.value <= 0) {
    error.value = 'Minutes must be a number greater than 0.'
    return
  }

  try {
    await activitiesStore.addActivity({
      type: type.value,
      minutes: minutes.value,
      date: date.value,
      notes: notes.value.trim() ? notes.value.trim() : undefined,
    })

    resetForm()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to add activity.'
  }
}

function startEdit(a: Activity) {
  editingId.value = a.id
  editDraft.value = JSON.parse(JSON.stringify(a))
}

function cancelEdit() {
  editingId.value = null
  editDraft.value = null
}

async function saveEdit() {
  if (!editDraft.value) return

  if (!editDraft.value.date) {
    error.value = 'Please choose a date.'
    return
  }
  if (!Number.isFinite(editDraft.value.minutes) || editDraft.value.minutes <= 0) {
    error.value = 'Minutes must be a number greater than 0.'
    return
  }

  try {
    await activitiesStore.updateActivity(editDraft.value)
    cancelEdit()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update activity.'
  }
}

async function remove(id: number) {
  const ok = confirm('Delete this activity?')
  if (!ok) return
  try {
    await activitiesStore.deleteActivity(id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete activity.'
  }
}
</script>

<template>
  <section class="section">
    <div class="container">
      <div class="level">
        <div class="level-left">
          <div>
            <h1 class="title">My Activities</h1>
            <p class="subtitle">Add, edit, and delete your workouts.</p>
          </div>
        </div>

        <div class="level-right">
          <RouterLink class="button" to="/">Back</RouterLink>
        </div>
      </div>

      <div v-if="error" class="notification is-danger is-light">
        {{ error }}
      </div>

      <div v-if="loading" class="notification is-info is-light">Loading activities...</div>

      <div class="box">
        <h2 class="title is-5">Add Activity</h2>

        <div class="columns is-multiline">
          <div class="column is-3">
            <label class="label">Type</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="type">
                  <option v-for="opt in activityTypeOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="column is-3">
            <label class="label">Minutes</label>
            <div class="control">
              <input v-model.number="minutes" class="input" type="number" min="1" />
            </div>
          </div>

          <div class="column is-3">
            <label class="label">Date</label>
            <div class="control">
              <input v-model="date" class="input" type="date" />
            </div>
          </div>

          <div class="column is-12">
            <label class="label">Notes (optional)</label>
            <div class="control">
              <textarea v-model="notes" class="textarea" rows="2" placeholder="How did it feel?"></textarea>
            </div>
          </div>

          <div class="column is-12">
            <button class="button is-link" @click="add">
              <span class="icon"><i class="fa-solid fa-plus"></i></span>
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>

      <div class="box">
        <h2 class="title is-5">Your Activity List</h2>

        <div v-if="activitiesStore.myActivities.length === 0" class="notification is-info is-light">
          No activities yet. Add one above.
        </div>

        <div v-else class="table-container">
          <table class="table is-fullwidth is-striped is-hoverable">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Minutes</th>
                <th>Notes</th>
                <th style="width: 220px;">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="a in activitiesStore.myActivities" :key="a.id">
                <td v-if="editingId !== a.id">{{ a.date }}</td>
                <td v-else>
                  <input v-model="editDraft!.date" class="input is-small" type="date" />
                </td>

                <td v-if="editingId !== a.id">{{ activityTypeLabelByValue[a.type] ?? a.type }}</td>
                <td v-else>
                  <div class="select is-small">
                    <select v-model="editDraft!.type">
                      <option v-for="opt in activityTypeOptions" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </option>
                    </select>
                  </div>
                </td>

                <td v-if="editingId !== a.id">{{ a.minutes }}</td>
                <td v-else>
                  <input v-model.number="editDraft!.minutes" class="input is-small" type="number" min="1" />
                </td>

                <td v-if="editingId !== a.id">{{ a.notes ?? '' }}</td>
                <td v-else>
                  <input v-model="editDraft!.notes" class="input is-small" placeholder="Optional" />
                </td>

                <td>
                  <div class="buttons are-small">
                    <button
                      v-if="editingId !== a.id"
                      class="button is-info"
                      @click="startEdit(a)"
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

                    <button
                      v-if="editingId === a.id"
                      class="button"
                      @click="cancelEdit"
                    >
                      Cancel
                    </button>

                    <button
                      v-if="editingId !== a.id"
                      class="button is-danger"
                      @click="remove(a.id)"
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
