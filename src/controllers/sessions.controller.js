const database = require('../config/db')

function getSessions(req, res) {
  const userId = Number(new URL(req.url, 'http://localhost').searchParams.get('userId')) || 0

  database.query(
    `SELECT s.id, s.tittel, s.opprettet_av, TIMESTAMP(s.dato, s.sluttid) < NOW() AS avsluttet, e.emnekode, st.brukernavn AS host,
            CONCAT_WS(' ', s.bygning, s.rom) AS rom,
            DATE_FORMAT(s.dato, '%Y-%m-%d') AS dato,
            TIME_FORMAT(s.starttid, '%H:%i') AS starttid,
            TIME_FORMAT(s.sluttid, '%H:%i') AS sluttid,
            s.maks_deltakere,
            s.maks_deltakere - (SELECT COUNT(*) FROM deltakere d
                                WHERE d.okt_id = s.id AND d.status = 'godkjent') AS ledigePlasser,
            (SELECT d.status FROM deltakere d
              WHERE d.okt_id = s.id AND d.student_id = ?) AS minStatus
     FROM studieokter s
     JOIN emner e ON e.id = s.emne_id
     JOIN studenter st ON st.id = s.opprettet_av
     ORDER BY s.dato, s.starttid`,
    [userId],
    (err, rows) => {
      if (err) {
        console.error(err)
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' })
        return res.end(JSON.stringify({ message: 'Kunne ikke hente økter.' }))
      }
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify(rows))
    }
  )
}

function createSessions(req,res){
    let body = ''
    req.on('data', chunk => {body += chunk})

    req.on('end', () =>{
        const send = (status, message) => {
            res.writeHead(status, {'Content-Type': 'application/json'})
            res.end(JSON.stringify({message}))
        }

        let data
        try {
            data = JSON.parse(body

            )
        } catch {
            return send(400, 'Ugyldig data')
        }

        const text = v => (typeof v === 'string' ? v.trim() : '')
        const tittel = text(data?.tittel)
        const emnekode = text(data?.emnekode)
        const dato = text(data?.dato)
        const starttid = text(data?.starttid)
        const sluttid = text(data?.sluttid)
        const bygning = text(data?.bygning)
        const rom = text(data?.rom)
        const opprettetAv = Number(data?.userId)
        const maks = Number(data?.maks_deltakere)
        if (!opprettetAv || !tittel || tittel.length > 100 || !emnekode || !dato || !starttid || !sluttid || !(maks >= 1)) {
            return send(400, 'Fyll ut tittel, emne, dato, start- og sluttid og antall plasser.')
        }

        database.query('SELECT id FROM emner WHERE emnekode = ?', [emnekode], (err, rows) => {
            if (err) { console.error(err); return send(500, 'Noe gikk galt.') }
            if (rows.length === 0) return send(400, 'Ukjent emnekode.')
            const emneId = rows[0].id
            database.query(
                'INSERT INTO studieokter (emne_id, opprettet_av, tittel, bygning, rom, maks_deltakere, dato, starttid, sluttid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [emneId, opprettetAv, tittel, bygning, rom, maks, dato, starttid, sluttid],
                err => {
                    if (err) { console.error(err); return send(500, 'Kunne ikke lagre økten.') }
                    send(201, 'Studieøkt lagret.')
                    }
                )
        })
    })
}

module.exports = {getSessions, createSessions}