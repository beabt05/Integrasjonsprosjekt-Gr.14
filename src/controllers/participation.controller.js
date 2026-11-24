const db = require('../config/db')   // match the import in sessions.controller.js

const query = (sql, params) => new Promise((resolve, reject) => {
  db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
})

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try { resolve(JSON.parse(body)) }
      catch { reject(new Error('BAD_JSON')) }
    })
  })
}

function send(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(payload))
}

const isId = n => Number.isInteger(n) && n > 0

function fail(res, err) {
  if (err.message === 'BAD_JSON') return send(res, 400, { message: 'Ugyldig JSON.' })
  console.error(err)
  return send(res, 500, { message: 'Noe gikk galt på serveren.' })
}

// POST /api/sessions/join   body: { sessionId, userId }
async function joinSession(req, res) {
  try {
    const data = await readJson(req)
    const sessionId = Number(data?.sessionId)
    const userId = Number(data?.userId)
    if (!isId(sessionId) || !isId(userId)) {
      return send(res, 400, { message: 'Ugyldig forespørsel.' })
    }

    const rows = await query(
      `SELECT opprettet_av, maks_deltakere,
              TIMESTAMP(dato, sluttid) < NOW() AS avsluttet,
              (SELECT COUNT(*) FROM deltakere
                WHERE okt_id = ? AND status = 'godkjent') AS antall
       FROM studieokter WHERE id = ?`,
      [sessionId, sessionId]
    )
    if (rows.length === 0) return send(res, 404, { message: 'Fant ikke økten.' })

    const s = rows[0]
    if (s.opprettet_av === userId) {
      return send(res, 400, { message: 'Du kan ikke bli med i din egen økt.' })
    }
    if (s.avsluttet) return send(res, 409, { message: 'Økten er avsluttet.' })
    if (s.antall >= s.maks_deltakere) {
      return send(res, 409, { message: 'Økten er full.' })
    }

    try {
      await query('INSERT INTO deltakere (okt_id, student_id) VALUES (?, ?)', [sessionId, userId])
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return send(res, 409, { message: 'Du har allerede sendt en forespørsel til denne økten.' })
      }
      if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return send(res, 404, { message: 'Fant ikke brukeren.' })
      }
      throw err
    }

    return send(res, 201, { message: 'Forespørsel sendt. Du får plass når verten godtar.' })
  } catch (err) {
    return fail(res, err)
  }
}

// GET /api/requests?userId=4  -> pending requests for sessions this user hosts
async function getRequests(req, res) {
  try {
    const userId = Number(new URL(req.url, 'http://localhost').searchParams.get('userId'))
    if (!isId(userId)) return send(res, 400, { message: 'Ugyldig bruker.' })

    const rows = await query(
      `SELECT d.okt_id AS sessionId, d.student_id AS studentId,
              st.brukernavn, s.tittel, e.emnekode
       FROM deltakere d
       JOIN studieokter s ON s.id = d.okt_id
       JOIN studenter st ON st.id = d.student_id
       JOIN emner e ON e.id = s.emne_id
       WHERE s.opprettet_av = ? AND d.status = 'venter'
       ORDER BY d.ble_med`,
      [userId]
    )
    return send(res, 200, rows)
  } catch (err) {
    return fail(res, err)
  }
}

// POST /api/requests/respond   body: { sessionId, studentId, userId, action }
// action is 'godkjent' or 'avslatt'; userId must be the host
async function respondToRequest(req, res) {
  try {
    const data = await readJson(req)
    const sessionId = Number(data?.sessionId)
    const studentId = Number(data?.studentId)
    const userId = Number(data?.userId)
    const action = data?.action

    if (!isId(sessionId) || !isId(studentId) || !isId(userId) ||
        !['godkjent', 'avslatt'].includes(action)) {
      return send(res, 400, { message: 'Ugyldig forespørsel.' })
    }

    const rows = await query(
      `SELECT s.opprettet_av, s.maks_deltakere,
              (SELECT COUNT(*) FROM deltakere
                WHERE okt_id = s.id AND status = 'godkjent') AS antall,
              (SELECT status FROM deltakere
                WHERE okt_id = s.id AND student_id = ?) AS status
       FROM studieokter s WHERE s.id = ?`,
      [studentId, sessionId]
    )
    if (rows.length === 0) return send(res, 404, { message: 'Fant ikke økten.' })

    const s = rows[0]
    if (s.opprettet_av !== userId) {
      return send(res, 403, { message: 'Bare verten kan svare på forespørsler.' })
    }
    if (s.status !== 'venter') {
      return send(res, 409, { message: 'Denne forespørselen er allerede behandlet.' })
    }
    if (action === 'godkjent' && s.antall >= s.maks_deltakere) {
      return send(res, 409, { message: 'Økten er full.' })
    }

    await query(
      `UPDATE deltakere SET status = ?
       WHERE okt_id = ? AND student_id = ? AND status = 'venter'`,
      [action, sessionId, studentId]
    )
    return send(res, 200, {
      message: action === 'godkjent' ? 'Deltaker godkjent.' : 'Forespørsel avslått.'
    })
  } catch (err) {
    return fail(res, err)
  }
}

module.exports = { joinSession, getRequests, respondToRequest }