const bcrypt = require('bcrypt')
const { supabase } = require('../lib/supabaseClient')

const TABLE = 'Users'

function sanitize(user) {
  if (!user) return null
  const { password, ...rest } = user
  return rest
}

async function list() {
  const { data, error } = await supabase.from(TABLE).select('*').order('id')
  if (error) throw error
  return (data ?? []).map(sanitize)
}

async function findById(id) {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? sanitize(data) : null
}

async function findByUsername(username) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('username', username)
    .maybeSingle()
  if (error) throw error
  return data ?? null
}

async function create(user) {
  const password = user.password ? await bcrypt.hash(user.password, 10) : null
  const payload = { ...user, password }

  const { data, error } = await supabase.from(TABLE).insert(payload).select('*').single()
  if (error) throw error
  return sanitize(data)
}

async function update(id, updates) {
  const payload = { ...updates }
  if (payload.password) {
    payload.password = await bcrypt.hash(payload.password, 10)
  }

  const { data, error } = await supabase.from(TABLE).update(payload).eq('id', id).select('*').maybeSingle()
  if (error) throw error
  return data ? sanitize(data) : null
}

async function remove(id) {
  const { data, error } = await supabase.from(TABLE).delete().eq('id', id).select('*').maybeSingle()
  if (error) throw error
  return data ? sanitize(data) : null
}

module.exports = {
  list,
  findById,
  findByUsername,
  create,
  update,
  remove,
  sanitize,
}
