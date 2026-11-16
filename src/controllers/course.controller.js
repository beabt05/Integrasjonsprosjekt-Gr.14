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

function createCourse(req, res) {
  let body = ''
  req.on('data', chunk => {body += chunk})

  req.on('end', () => {
    const send = (status, message) => {
      res.writeHead(status, {'Content-Type': 'application/json; charset=utf-8'})
      res.end(JSON.stringify({message }))
    }

    let data
    try {
      data = JSON.parse(body)
    } catch {
      return send(400, 'Ugyldig data.')
    }

    const text = v => (typeof v === 'string' ? v.trim() : '')
    const emnekode = text(data?.emnekode)
    const navnNo = text(data?.navn_no)
    if (!emnekode || emnekode.length > 20 || !navnNo || navnNo.length > 100) {
      return send(400, 'Oppgi emnekode og gyldig emnenavn.')
    }

    database.query(
      'INSERT INTO emner (emnekode, navn_no, navn_en, beskrivelse_no, beskrivelse_en) VALUES (?, ?, ?, ?, ?)',
      [emnekode, navnNo, text(data.navn_en) || navnNo,
       text(data.beskrivelse_no), text(data.beskrivelse_en)],
      err => {
        if (err && err.code === 'ER_DUP_ENTRY') return send(409, 'Emnekoden finnes allerede.')
        if (err) { console.error(err); return send(500, 'Kunne ikke opprette emnet.') }
        send(201, 'Emnet er opprettet.')
      }
    )
  })
}

module.exports = { getCourses, createCourse }