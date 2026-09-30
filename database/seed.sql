-- Study Buddy - testdata
-- Alle testbrukere har passordet:  "Passord123"

USE study_buddy;

-- 3 testbrukere, én av dem er admin
INSERT INTO studenter (brukernavn, epost, passord, rolle) VALUES
  ('admin', 'admin@stud.ntnu.no', 'Passord123', 'admin'),
  ('kari',  'kari@stud.ntnu.no',  'Passord123', 'student'),
  ('ola',   'ola@stud.ntnu.no',   'Passord123', 'student');

-- Emner
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