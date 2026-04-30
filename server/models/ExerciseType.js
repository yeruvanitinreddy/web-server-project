const { supabase } = require('../lib/supabaseClient')

const TABLE = 'ExerciseTypes'

async function list() {
  const { data, error } = await supabase.from(TABLE).select('*').order('name')
  if (error) throw error
  return data ?? []
}

async function create(exerciseType) {
  const { data, error } = await supabase.from(TABLE).insert(exerciseType).select('*').single()
  if (error) throw error
  return data
}

async function update(id, updates) {
  const { data, error } = await supabase.from(TABLE).update(updates).eq('id', id).select('*').maybeSingle()
  if (error) throw error
  return data ?? null
}

async function remove(id) {
  const { data, error } = await supabase.from(TABLE).delete().eq('id', id).select('*').maybeSingle()
  if (error) throw error
  return data ?? null
}

module.exports = {
  list,
  create,
  update,
  remove,
}
