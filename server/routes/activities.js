const express = require('express')
const {
  listActivities,
  createActivity,
  updateActivity,
  deleteActivity,
} = require('../controllers/activitiesController')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

router.use(authenticate)

router.get('/', listActivities)
router.post('/', createActivity)
router.put('/:id', updateActivity)
router.delete('/:id', deleteActivity)

module.exports = router
