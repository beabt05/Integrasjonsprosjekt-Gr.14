// Load environment variables from the local .env file so we can connect to the database and configure the server.
require('dotenv').config()
const http = require('http')
const path = require('path')
const mysql = require('mysql2')
const fs = require('fs')
const crypto = require('crypto')

// Create a single MySQL connection for the app and reuse it for database queries.
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
})

// Establish the database connection and log a clear error if initialization fails.
db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err)
    return
  }

  console.log('Connected to MySQL!')
})

// Create the main HTTP server and handle both registration requests and static file delivery.
const server = http.createServer((req, res) => {

  // Handle new user registration submitted as form data.
  if (req.method === 'POST' && req.url === '/api/auth/register') {
    let body = ''
    req.on('data', chunk => {
      body += chunk
    })

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
      const salt = crypto.randomBytes(16).toString('hex')

      crypto.scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'application/json'})
          res.end(JSON.stringify({ message: 'Noe gikk galt.'}))
          return
        }

        const hash = salt + ":" + derivedKey.toString('hex')
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ message: 'Bruker registrert: ' + email}))
      })
    })
    return
  }

  // Build the correct file path for public assets and pages served from the /public folder.
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
