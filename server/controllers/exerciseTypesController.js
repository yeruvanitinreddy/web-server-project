const ExerciseTypes = require('../models/ExerciseType')

async function listExerciseTypes(_req, res) {
  const exerciseTypes = await ExerciseTypes.list()
  return res.json(exerciseTypes)
}

async function createExerciseType(req, res) {
  const { name } = req.body ?? {}
  if (!name) {
    return res.status(400).json({ error: 'Exercise type name is required.' })
  }

  const created = await ExerciseTypes.create({ name })
  return res.status(201).json(created)
}

async function updateExerciseType(req, res) {
  const exerciseTypeId = Number(req.params.id)
  if (!Number.isFinite(exerciseTypeId)) {
    return res.status(400).json({ error: 'Invalid exercise type id.' })
  }

  const updated = await ExerciseTypes.update(exerciseTypeId, req.body ?? {})
  if (!updated) {
    return res.status(404).json({ error: 'Exercise type not found.' })
  }

  return res.json(updated)
}

async function deleteExerciseType(req, res) {
  const exerciseTypeId = Number(req.params.id)
  if (!Number.isFinite(exerciseTypeId)) {
    return res.status(400).json({ error: 'Invalid exercise type id.' })
  }

  const deleted = await ExerciseTypes.remove(exerciseTypeId)
  if (!deleted) {
    return res.status(404).json({ error: 'Exercise type not found.' })
  }

  return res.json(deleted)
}

module.exports = {
  listExerciseTypes,
  createExerciseType,
  updateExerciseType,
  deleteExerciseType,
}
