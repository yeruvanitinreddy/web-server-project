const { supabase } = require('../lib/supabaseClient')

const TABLE = 'Activities'

async function list({ userId } = {}) {
  let query = supabase.from(TABLE).select('*')
  if (userId) {
    query = query.eq('userId', userId)
  }

  const { data, error } = await query.order('date', { ascending: false }).order('id', { ascending: false })
  if (error) throw error
  return data ?? []
}

async function findById(id) {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ?? null
}

async function create(activity) {
  const { data, error } = await supabase.from(TABLE).insert(activity).select('*').single()
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
  findById,
  create,
  update,
  remove,
}
