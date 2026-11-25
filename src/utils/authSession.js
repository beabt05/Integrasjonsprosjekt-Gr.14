const crypto = require('crypto')

const store = new Map()

function createSession(studentId) {
    const token = crypto.randomBytes(32).toString('hex')
    store.set(token, studentId)
    return token
}

function getStudentId(token) {
  return store.get(token)
}

module.exports = { createSession, getStudentId }