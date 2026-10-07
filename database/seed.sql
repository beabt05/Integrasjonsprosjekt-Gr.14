-- =====================================================================
-- Study Buddy - testdata
-- Kjør etter schema.sql. Alle testbrukere har passordet: Passord123!
-- =====================================================================

USE study_buddy;

-- Brukere (id 1, 2, 3)
INSERT INTO studenter (brukernavn, epost, passord, rolle) VALUES
  ('admin', 'admin@stud.ntnu.no', 'Passord123!', 'admin'),
  ('kari',  'kari@stud.ntnu.no',  'Passord123!', 'student'),
  ('ola',   'ola@stud.ntnu.no',   'Passord123!', 'student');

-- Emner (id 1, 2, 3)
INSERT INTO emner (emnekode, navn_en, navn_no, beskrivelse_en, beskrivelse_no) VALUES
  ('IDG2052', 'Programming', 'Programmering',
   'A relaxed and friendly study group for anyone interested in programming.',
   'En avslappet og hyggelig kollokviegruppe for alle som er interessert i programmering.'),
  ('IDATG2208', 'Machine Learning', 'Maskinlæring',
   'A relaxed and friendly study group for anyone interested in machine learning.',
   'En avslappet og hyggelig kollokviegruppe for alle som er interessert i maskinlæring.'),
  ('IDATG2102', 'Algorithmic Methods', 'Algoritmiske metoder',
   'A relaxed and friendly study group for anyone interested in algorithms.',
   'En avslappet og hyggelig kollokviegruppe for alle som er interessert i algoritmer.');

-- To aktive studieøkter i to forskjellige emner (id 1, 2)
-- Datoene regnes ut fra dagens dato, så øktene er alltid i fremtiden
INSERT INTO studieokter (emne_id, opprettet_av, tittel, bygning, rom, maks_deltakere, dato, starttid) VALUES
  (1, 2, 'Øving i programmering',    'A-bygget', 'A221', 3, CURDATE() + INTERVAL 1 DAY, '14:00'),
  (3, 3, 'Eksamenslesing algoritmer', 'S-bygget', 'S206', 2, CURDATE() + INTERVAL 3 DAY, '10:00');

-- Deltakere
-- Økt 1: kari (laget den) og ola, 2 av 3 plasser, én ledig
-- Økt 2: ola (laget den) og admin, 2 av 2 plasser, full
INSERT INTO deltakere (okt_id, student_id) VALUES
  (1, 2),
  (1, 3),
  (2, 3),
  (2, 1);