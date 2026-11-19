require('dotenv').config()
const mysql = require('mysql2')

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

module.exports = db