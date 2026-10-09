const crypto = require('crypto')
const db = require('../config/db')

// Register a new student account by validating the input, hashing the password,
// and inserting the user record into the database with a unique username.
function register(req, res) {
    // Read the incoming request body so it can be parsed as JSON.
    let body = ''
    req.on('data', chunk => {
      body += chunk
    })

    // Parse the body once it has been fully received and validate the payload.
    req.on('end', ()=> {
      let data
      try {
        data = JSON.parse(body)
      } catch {
        res.writeHead(400, {'Content-Type': 'application/json'})
        res.end(JSON.stringify({message: 'Ugyldig data'}))
        return
      }

      const {email, password} = data
      if (!email || !password) {
        res.writeHead(400, {'Content-Type': 'application/json'})
        res.end(JSON.stringify({message: 'Epost og passord må fylles ut'}))
        return
      }

      // Generate a new random salt for each user to protect the password hash.
      const salt = crypto.randomBytes(16).toString('hex')
      const brukernavn = email.split('@')[0]

      // Hash the plaintext password with scrypt before saving it to the database.
      crypto.scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'application/json'})
          res.end(JSON.stringify({ message: 'Noe gikk galt.'}))
          return
        }

        // Store the salt and hash as a single value so the password can later be verified.
        const hash = salt + ":" + derivedKey.toString('hex')
        db.query(
          'INSERT INTO studenter (brukernavn, epost, passord) VALUES (?, ?, ?)',
          [brukernavn, email, hash],
          (err, result) => {
            if (err && err.code === 'ER_DUP_ENTRY') {
              res.writeHead(409, {'Content-Type': 'application/json'})
              res.end(JSON.stringify({message: 'Eposten er allerede i bruk.'}))
              return
            }
            if (err) {
              res.writeHead(500, {'Content-Type': 'application/json'})
              res.end(JSON.stringify({message: 'Noe gikk galt.'}))
              return
            }
            res.writeHead(201, {'Content-Type': 'application/json'})
            res.end(JSON.stringify({message: 'Bruker registrert'}))
          }
        )
      })
    })
}

// Log in an existing user by retrieving the stored password hash and comparing it
// with a freshly derived hash from the submitted password.
function login(req, res) {
    // Collect the incoming JSON payload from the request body.
    let body = ''
    req.on('data', chunk => {
      body += chunk
    })

    // Parse the request after all data has been received.
    req.on('end', () => {
      let data
      try {
        data = JSON.parse(body)
      } catch {
        res.writeHead(400, {'Content-Type': 'application/json'})
        res.end(JSON.stringify({message: 'Ugyldig data'}))
        return
      }

      const {email, password} = data
      if (!email || !password) {
        res.writeHead(400, {'Content-Type': 'application/json'})
        res.end(JSON.stringify({message: 'Epost og passord må fylles ut'}))
        return
      }

      // Find the stored hash for the email address before verifying the submitted password.
      db.query(
        'SELECT passord FROM studenter WHERE epost = ?',
        [email],
        (err, rows) => {
          if (err) {
            res.writeHead(500, {'Content-Type': 'application/json'})
            res.end(JSON.stringify({message: 'Noe gikk galt.'}))
            return
          }
          if (rows.length === 0) {
            res.writeHead(401, {'Content-Type': 'application/json'})
            res.end(JSON.stringify({message: 'Feil passord eller epost.'}))
            return
          }

          // Split the stored value into salt and hash so the submitted password can be tested safely.
          const [salt, storedHash] = rows[0].passord.split(':')
          crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) {
              res.writeHead(500, {'Content-Type': 'application/json'})
              res.end(JSON.stringify({message: 'Noe gikk galt.'}))
              return
            }

            // timingSafeEqual protects authentication from timing attacks during comparison.
            const match = crypto.timingSafeEqual(derivedKey, Buffer.from(storedHash, 'hex'))

            if (match) {
              res.writeHead(200, {'Content-Type': 'application/json'})
              res.end(JSON.stringify({message: 'Innlogging vellykket.'}))
              return
            }
            res.writeHead(401, {'Content-Type': 'application/json'})
            res.end(JSON.stringify({message: 'Feil passord eller epost.'}))
          })
        }
      )
    })
}

module.exports = {register, login}