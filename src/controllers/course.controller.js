const database = require('../config/db')

function getCourses(req, res) {
  database.query(
    'SELECT id, emnekode, navn_no, navn_en, beskrivelse_no, beskrivelse_en FROM emner',
    (err, rows) => {
      if (err) {
        console.error(err)
        res.writeHead(500, {'Content-Type': 'application/json'})
        res.end(JSON.stringify({message: 'Noe gikk galt.' }))
        return
      }
      res.writeHead(200, {'Content-Type': 'application/json'})
      res.end(JSON.stringify(rows))
    }
  )
}

module.exports = {getCourses}