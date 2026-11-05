// Import the Node.js built-ins and libraries required for HTTP serving, file handling, crypto hashing and database work.
const http = require('http')
const path = require('path')
const authController = require('./src/controllers/auth.controller')
const fs = require('fs')
const crypto = require('crypto')
const { resourceUsage } = require('process')


// Create the main HTTP server. It handles API requests and serves static files from the public directory.
const server = http.createServer((req, res) => {

  // Handle the registration endpoint: validate input, hash the password, and save the user record.
  if (req.method === 'POST' && req.url === '/api/auth/register') {
    authController.register(req, res)
    return
  }

  // Handle the login endpoint by delegating authentication to the controller layer.
  if (req.method === 'POST' && req.url === '/api/auth/login') {
    authController.login(req, res)
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
