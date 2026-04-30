<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { Activity, ActivityType } from '@/types'
import { useActivitiesStore } from '@/stores/activities'
import { supabase } from '@/lib/supabase'

const activitiesStore = useActivitiesStore()
const type = ref<ActivityType>('run')
const minutes = ref<number>(30)
const date = ref<string>(new Date().toISOString().slice(0, 10))
const notes = ref<string>('')

const error = ref<string | null>(null)

const activityTypeOptions = ref<{ value: ActivityType; label: string }[]>([])

function normalizeType(name: string): ActivityType {
  const key = name.toLowerCase().replace(/\s+/g, '_')
  return key as ActivityType
}

onMounted(async () => {
  // load activity types
  const { data, error } = await supabase.from('ExerciseTypes').select('name').order('name')
  if (error) {
    console.error(error)
    return
  }

  activityTypeOptions.value = (data ?? []).map((row: { name: string }) => ({
    value: normalizeType(row.name),
    label: row.name,
  }))

  if (!activityTypeOptions.value.find((o) => o.value === type.value)) {
    type.value = activityTypeOptions.value[0]?.value ?? 'run'
  }

  // ✅ load activities from DB
  await activitiesStore.loadMyActivities()
})

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

  await activitiesStore.addActivity({
    type: type.value,
    minutes: minutes.value,
    date: date.value,
    notes: notes.value.trim() ? notes.value.trim() : undefined,
  })

  resetForm()
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

  await activitiesStore.updateActivity(editDraft.value)
  cancelEdit()
}

async function remove(id: number) {
  const ok = confirm('Delete this activity?')
  if (!ok) return
  await activitiesStore.deleteActivity(id)
}
</script>