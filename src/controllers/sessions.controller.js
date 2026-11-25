const database = require('../config/db')

function getSessions(req, res){
    database.query(
        'SELECT id, emne_id, opprettet_av, tittel, bygning, rom, maks_deltakere, dato, starttid, sluttid, opprettet FROM studieokter',
        (err, rows) => {
            if (err) {
                console.error(err)
                res.writeHead(500, {'Content-Type': 'application/json'})
                res.end(JSON.stringify({message: 'Noe gikk galt.'}))
                return
            }
            res.writeHead(200, {'Content-Type': 'application/json'})
            res.end(JSON.stringify(rows))
        }
    )
}

function createSession(res, session, studentId) {
    const sql = `
        INSERT INTO studieokter
            (emne_id, opprettet_av, tittel, bygning, rom,
            maks_deltakere, dato, starttid, sluttid)
        SELECT e.id, ?, ?, ?, ?, ?, ?, ?, ?
        FROM emner AS e
        WHERE e.emnekode = ?
    `;

    const values = [
        studentId, session.tittel, session.bygning,
        session.rom, session.maks_deltakere, session.dato,
        session.starttid, session.sluttid, session.emnekode,
    ];

    database.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Kunne ikke opprette økten.' }));
            return;
        }

        if (result.affectedRows === 0) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Ukjent emnekode.' }));
            return;
        }

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            id: String(result.insertId),
            message: 'Økten ble opprettet.',
        }));
    });
}

module.exports = { getSessions, createSession };

