require('dotenv').config()
const express = require('express')
const mysql = require('mysql2')
const path = require('path')

const app = express()
const PORT = 3000

app.use(express.json())

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
})

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err)
    return
  }

  console.log('Connected to MySQL!')
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

/*
app.get("/", (req, res) => {
    res.send("PROG2052 Node server is running!");
});
*/

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working!'
  })
})
