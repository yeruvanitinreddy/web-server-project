const express = require('express')
const {
  listExerciseTypes,
  createExerciseType,
  updateExerciseType,
  deleteExerciseType,
} = require('../controllers/exerciseTypesController')
const { authenticate, requireAdmin } = require('../middleware/auth')

const router = express.Router()

router.use(authenticate)

router.get('/', listExerciseTypes)
router.post('/', requireAdmin, createExerciseType)
router.put('/:id', requireAdmin, updateExerciseType)
router.delete('/:id', requireAdmin, deleteExerciseType)

module.exports = router
