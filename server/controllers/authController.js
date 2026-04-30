const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Users = require('../models/User')

async function login(req, res) {
  const { username, password } = req.body ?? {}

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' })
  }

  const user = await Users.findByUsername(username)
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password.' })
  }

  const isValid = await bcrypt.compare(password, user.password ?? '')
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid username or password.' })
  }

  const safeUser = Users.sanitize(user)
  const token = jwt.sign(
    { id: safeUser.id, role: safeUser.role, username: safeUser.username },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  )

  return res.json({ token, user: safeUser })
}

module.exports = { login }
