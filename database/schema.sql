
CREATE DATABASE IF NOT EXISTS study_buddy
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE study_buddy;


-- Nye studenter/brukere
CREATE TABLE IF NOT EXISTS studenter (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  brukernavn  VARCHAR(50)  NOT NULL,
  epost       VARCHAR(255) NOT NULL UNIQUE,
  passord     VARCHAR(255) NOT NULL,
  rolle       ENUM('student', 'admin') NOT NULL DEFAULT 'student',
  opprettet   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Emner 
CREATE TABLE IF NOT EXISTS emner (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  emnekode        VARCHAR(20)  NOT NULL UNIQUE,
  navn_en         VARCHAR(255) NOT NULL,
  navn_no         VARCHAR(255) NOT NULL,
  beskrivelse_en  TEXT,
  beskrivelse_no  TEXT,
  aktiv           BOOLEAN NOT NULL DEFAULT TRUE
);

-- Liste over registrerte brukere (uten passord)
CREATE OR REPLACE VIEW registrerte_brukere AS
  SELECT id, brukernavn, epost, rolle, opprettet
  FROM studenter;

CREATE TABLE IF NOT EXISTS studieokter (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  emne_id  INT NOT NULL,
  opprettet_av INT NOT NULL,
  tittel    VARCHAR(100) NOT NULL,
  bygning   VARCHAR(10),
  rom       VARCHAR(10),
  maks_deltakere  INT NOT NULL DEFAULT 3,
  dato      DATE NOT NULL,
  starttid  TIME NOT NULL,
  opprettet TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (emne_id)   REFERENCES emner(id),
  FOREIGN KEY (opprettet_av) REFERENCES studenter(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS deltakere (
  okt_id      INT NOT NULL,
  student_id  INT NOT NULL,
  ble_med     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (okt_id, student_id), 
  FOREIGN KEY (okt_id) REFERENCES studieokter(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES studenter(id) ON DELETE CASCADE
);
