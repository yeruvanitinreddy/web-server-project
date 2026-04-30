const Activities = require('../models/Activity')

async function listActivities(req, res) {
  try {
    const userIdParam = req.query.userId ? Number(req.query.userId) : null
    const userId = Number.isFinite(userIdParam) ? userIdParam : undefined
    const activities = await Activities.list({ userId })
    return res.json(activities)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to load activities.' })
  }
}

async function createActivity(req, res) {
  const { type, minutes, date, notes, userId: bodyUserId } = req.body ?? {}
  const minutesValue = Number(minutes)

  if (!type || !date || !Number.isFinite(minutesValue) || minutesValue <= 0) {
    return res.status(400).json({ error: 'Missing required activity fields.' })
  }

  const userId = req.user.role === 'admin' && bodyUserId ? bodyUserId : req.user.id
  const created = await Activities.create({ type, minutes: minutesValue, date, notes, userId })
  return res.status(201).json(created)
}

async function updateActivity(req, res) {
  const activityId = Number(req.params.id)
  if (!Number.isFinite(activityId)) {
    return res.status(400).json({ error: 'Invalid activity id.' })
  }

  const existing = await Activities.findById(activityId)
  if (!existing) {
    return res.status(404).json({ error: 'Activity not found.' })
  }

  if (req.user.role !== 'admin' && existing.userId !== req.user.id) {
    return res.status(403).json({ error: 'Not allowed to edit this activity.' })
  }

  const updates = { ...(req.body ?? {}) }
  if (req.user.role !== 'admin') {
    delete updates.userId
  }
  const updated = await Activities.update(activityId, updates)
  return res.json(updated)
}

async function deleteActivity(req, res) {
  const activityId = Number(req.params.id)
  if (!Number.isFinite(activityId)) {
    return res.status(400).json({ error: 'Invalid activity id.' })
  }

  const existing = await Activities.findById(activityId)
  if (!existing) {
    return res.status(404).json({ error: 'Activity not found.' })
  }

  if (req.user.role !== 'admin' && existing.userId !== req.user.id) {
    return res.status(403).json({ error: 'Not allowed to delete this activity.' })
  }

  const deleted = await Activities.remove(activityId)
  return res.json(deleted)
}

module.exports = {
  listActivities,
  createActivity,
  updateActivity,
  deleteActivity,
}
