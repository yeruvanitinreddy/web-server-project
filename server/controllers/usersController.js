const Users = require('../models/User')

async function listUsers(_req, res) {
  try {
    const users = await Users.list()
    return res.json(users)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to load users.' })
  }
}

async function createUser(req, res) {
  const { firstName, lastName, username, password, role } = req.body ?? {}

  if (!firstName || !lastName || !username || !password || !role) {
    return res.status(400).json({ error: 'Missing required user fields.' })
  }

  try {
    const created = await Users.create({ firstName, lastName, username, password, role })
    return res.status(201).json(created)
  } catch (error) {
    console.error(error)
    const message =
      typeof error?.message === 'string' && error.message.toLowerCase().includes('duplicate')
        ? 'Username already exists.'
        : 'Failed to create user.'
    const status = message === 'Username already exists.' ? 409 : 500
    return res.status(status).json({ error: message })
  }
}

async function updateUser(req, res) {
  const userId = Number(req.params.id)
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ error: 'Invalid user id.' })
  }

  const updated = await Users.update(userId, req.body ?? {})
  if (!updated) {
    return res.status(404).json({ error: 'User not found.' })
  }

  return res.json(updated)
}

async function deleteUser(req, res) {
  const userId = Number(req.params.id)
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ error: 'Invalid user id.' })
  }

  const deleted = await Users.remove(userId)
  if (!deleted) {
    return res.status(404).json({ error: 'User not found.' })
  }

  return res.json(deleted)
}

module.exports = {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
}
