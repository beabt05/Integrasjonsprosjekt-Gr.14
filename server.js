require('dotenv').config()
const http = require('http')
const path = require('path')
const fs = require('fs')
const db = require('./db')



const server = http.createServer((req, res) => {   
  if (req.method == 'POST' && req.url === '/api/auth/register'){   //checks that the form reaches the route
    let body = '';

    req.on('data', chunk => {

      body += chunk;
    });

    req.on('end', () => {
      try {
        const {username, password} = JSON.parse(body);

        if (
          typeof username !== 'string' ||
          typeof password !== 'string' ||
          !username.trim() ||
          !password
        ) {
          res.writeHead(400, {'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            message: 'Skriv inn brukernavn og passord.'
          }));
          return;
        }
          
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({
            message: `Motatt brukernavn: ${username.trim()}`

          }));
        } catch {
          res.writeHead(400, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({
            message:'Ugyldige data'
          }));
        }
        });

        return;

    }
    //Build file path

  

  let filePath = path.join(
    __dirname,
    'public',
    req.url === '/' ? 'index.html' : req.url
  )

  // Extension of file

  let extname = path.extname(filePath)

  // Iniial content type
  let contentType = 'text/html'

  // Check ext and set content type
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

  // Use Node's file system module to read the file located at filePath.

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code == 'ENOENT') {
        // Page not found
        fs.readFile(
          path.join(__dirname, 'public', '404.html'),
          (err, content) => {
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.end(content, 'utf8')
          }
        )
      } else {
        // Some server error
        res.writeHead(500)
        res.end(`Server Error: ${err.code}`)
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType })
      res.end(content, 'utf8')
    }
  })
})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
