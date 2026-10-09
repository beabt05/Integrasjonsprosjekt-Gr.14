require('dotenv').config()
const http = require('http')
const path = require('path')
const fs = require('fs')
const db = require('./db')
const bcrypt = require('bcryptjs')

db.execute('SELECT DATABASE() AS db_name, @@hostname AS db_server')
  .then(([rows]) => console.log('Connected database:', rows[0]))
  .catch(console.error);


const server = http.createServer((req, res) => {   
  if (req.method == 'POST' && req.url === '/api/auth/register'){   //checks that the form reaches the route
    let body = '';

    req.on('data', chunk => {

      body += chunk;
    });

    req.on('end', async () => {
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
          const passwordHash = await bcrypt.hash(password, 12);
          await db.execute(
            'INSERT INTO users (username, password_hash) VALUES (?, ?)',
            [username.trim(), passwordHash]
          );

          res.writeHead(201, { 'Content-Type': 'application/json'});
          res.end(JSON.stringify({
            message:'Bruker opprettet. Nå kan du logge inn.'
          }));


        } catch (err) { console.error('registration failed:', err);
          res.writeHead(400, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({
            message:'Ugyldige data'
          }));
        }
        });

        return;

    }
    //Build file path
    if (req.method === 'POST' && req.url === '/api/auth/login') {
        let body = '';
        req.on('data', chunk => {  //collects data submitted by the form
          body += chunk;
        });
    
    
    // Compare the password with the saved hash
    // Send the welcome message if thy match
    
    
    req.on('end', async () => {  // (wraps the username and reads after all the data arrives)
    const { username, password } = JSON.parse(body);

    // Read username and password

    const [users] = await db.execute(  //looks up the submitted username in the db
    'SELECT username, password_hash FROM users WHERE username = ?',
    [username]
      );
    
      // Find the user in the database  
    
    const user = users[0]; //selects the user returned by the query
    
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {  //error handling if the user doesn't exist or password is wrong
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: 'Feil brukernavn eller passord.'  
      }));
      return;
    }

      res.writeHead(200, {'Content-Type' : 'application/json'});
      res.end(JSON.stringify({
        message: `Velkommen, ${user.username}! Du er logget inn!`
      }));
    });
    
    return;
}
  

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
