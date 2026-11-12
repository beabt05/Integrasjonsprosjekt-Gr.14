const database = require('../config/db')

function getSessions(req, res){
    database.query(
        'SELECT id, emne_id, opprettet_av, tittel, bygning, rom, maks_deltakere, dato, starttid, slutttid, opprettet FROM studieokter',
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

module.exports = {getSessions}