require('dotenv').config()
const http = require('http')
const path = require('path')
const fs = require('fs')
const db = require('./db')
const crypto = require('crypto')
const { promisify } = require('util');
const scrypt = promisify(crypto.scrypt);

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
        const { username, email, password } = JSON.parse(body);

        if (
          typeof username !== 'string' ||
          typeof password !== 'string' ||
          typeof email !== 'string' ||
          !email.trim() ||
          !username.trim() ||
          !password
        ) {
          res.writeHead(400, {'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            message: 'Skriv inn brukernavn og passord.'
          }));
          return;
        }
          const salt = crypto.randomBytes(16).toString('hex');
          const derivedKey = await scrypt(password, salt, 64);
          const passwordHash = salt + ':' + derivedKey.toString('hex');
          await db.execute(
            'INSERT INTO studenter (brukernavn, epost, passord) VALUES (?, ?, ?)',
            [username.trim(), email.trim(), passwordHash]
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
      try {
    const { email, password } = JSON.parse(body);
    

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: 'Skriv inn e-postadresse og passord.'
      }));
      return;
    }

    // Read username and password

    const [users] = await db.execute(
    'SELECT brukernavn AS username, passord AS password_hash FROM studenter WHERE epost = ?',
    [email]
    );;
    
      // Find the user in the database  
    
    const user = users[0]; //selects the user returned by the query
    
    if (!user) {  //error handling if the user doesn't exist or password is wrong
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: 'Feil brukernavn eller passord.'  
      }));
      return;
    }

    const [salt, storedHash] = user.password_hash.split(':');
    const savedKey = Buffer.from(storedHash, 'hex');
    const enteredKey = await scrypt(password, salt, 64);

    if (
      savedKey.length !== enteredKey.length ||  //This rejects incorrect passwords before the welcome response.
      !crypto.timingSafeEqual(savedKey, enteredKey)
    ) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: 'Feil e-postadresse eller passord.'
      }));
      return;
    }

      res.writeHead(200, {'Content-Type' : 'application/json'});
      res.end(JSON.stringify({
        message: `Velkommen, ${user.username}! Du er logget inn!`
    }));
  } catch (err) {
    console.error('login failed:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'Kunne ikke logge inn. Prøv igjen senere.'
    }));
  }
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
