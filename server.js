// Load environment variables from the local .env file so the app can access database credentials and server settings.
require('dotenv').config()

// Import the Node.js built-ins and libraries required for HTTP serving, file handling, crypto hashing and database work.
const http = require('http')
const path = require('path')
const mysql = require('mysql2')
const fs = require('fs')
const crypto = require('crypto')
const { resourceUsage } = require('process')

// Create a single MySQL connection and reuse it across the application to reduce connection overhead.
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
})

// Try to open the database connection when the server starts, and fail early with a clear error if credentials are wrong.
db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err)
    return
  }

  console.log('Connected to MySQL!')
})

// Create the main HTTP server. It handles API requests and serves static files from the public directory.
const server = http.createServer((req, res) => {

  // Handle the registration endpoint: validate input, hash the password, and save the user record.
  if (req.method === 'POST' && req.url === '/api/auth/register') {
    // Collect the request body so it can be parsed as JSON after the stream ends.
    let body = ''
    req.on('data', chunk => {
      body += chunk
    })

    // Once the full request body is received, parse the JSON and validate the required fields.
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

      // Generate a unique salt for each user so password hashes are not predictable.
      const salt = crypto.randomBytes(16).toString('hex')
      const brukernavn = email.split('@')[0]

      // Use scrypt to hash the password before storing it, keeping the original password out of the database.
      crypto.scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'application/json'})
          res.end(JSON.stringify({ message: 'Noe gikk galt.'}))
          return
        }

        // Save the salt and hash together so the password can later be checked safely.
        const hash = salt + ":" + derivedKey.toString('hex')
        db.query(
          'INSERT INTO studenter (brukernavn, epost, passord) VALUES (?, ?, ?)',
          [brukernavn, email, hash],
          (err, result) => {
            if (err && err.code === 'ER_DUP_ENTRY') {
              res.writeHead(409, {'Content-Type': 'application/json'})
              res.end(JSON.stringify({message: 'Eposten er allerede i bruk.'}))
              console.log(err)
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
    return
  }

  if (req.method === 'POST' && req.url === '/api/auth/login') {
    let body = ''
    req.on('data', chunk => {
      body += chunk
    })

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
          const [salt, storedHash] = rows[0].passord.split(':')
          crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) {
              res.writeHead(500, {'Content-Type': 'application/json'})
              res.end(JSON.stringify({message: 'Noe gikk galt.'}))
              return
            }
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
    return
  }
  // Resolve the requested file path inside the public folder; the root URL serves the landing page.
  let filePath = path.join(
    __dirname,
    'public',
    req.url === '/' ? 'index.html' : req.url
  )

  // Extract the file extension so the response can advertise the proper MIME type.
  let extname = path.extname(filePath)

  // Default to HTML unless the file is a script, stylesheet, JSON payload, or image.
  let contentType = 'text/html'

  // Map common file types to their content type so browsers render them correctly.
  switch (extname) {
    case '.js':
      contentType = 'text/javascript'
      break
    case '.css':
      contentType = 'text/css'
      break
    case '.json':
      contentType = 'application/json'
      break
    case '.png':
      contentType = 'image/png'
      break
    case '.jpg':
      contentType = 'image/jpg'
      break
  }

  // Read the requested file from disk and serve it back to the client.
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code == 'ENOENT') {
        // If the page or asset does not exist, serve the custom 404 page instead of failing silently.
        fs.readFile(
          path.join(__dirname, 'public', '404.html'),
          (err, content) => {
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.end(content, 'utf8')
          }
        )
      } else {
        // Any other file read error is treated as a server-side issue.
        res.writeHead(500)
        res.end(`Server Error: ${err.code}`)
      }
    } else {
      // Serve the file with the detected MIME type and UTF-8 encoding for text-based resources.
      res.writeHead(200, { 'Content-Type': contentType })
      res.end(content, 'utf8')
    }
  })
})

// Listen on the configured port or default to 3000 when no environment variable is provided.
const PORT = process.env.PORT || 3000

server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
