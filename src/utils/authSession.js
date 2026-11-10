const crypto = require('crypto')

const store = new Map()

function createSession(studentId) {
    token = crypto.randomBytes(32).toString('hex')
    store.set(token, studentId)
    return token
}

module.exports = {createSession}