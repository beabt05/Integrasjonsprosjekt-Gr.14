
CREATE DATABASE IF NOT EXISTS study_buddy
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE study_buddy;

DROP VIEW IF EXISTS registrerte_brukere;
DROP TABLE IF EXISTS emner;
DROP TABLE IF EXISTS studenter;

-- Nye studenter/brukere
CREATE TABLE studenter (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  brukernavn  VARCHAR(50)  NOT NULL UNIQUE,
  epost       VARCHAR(255) NOT NULL UNIQUE,
  passord     VARCHAR(255) NOT NULL,
  rolle       ENUM('student', 'admin') NOT NULL DEFAULT 'student',
  opprettet   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Emner 
CREATE TABLE emner (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  emnekode        VARCHAR(20)  NOT NULL UNIQUE,
  navn_en         VARCHAR(255) NOT NULL,
  navn_no         VARCHAR(255) NOT NULL,
  beskrivelse_en  TEXT,
  beskrivelse_no  TEXT,
  aktiv           BOOLEAN NOT NULL DEFAULT TRUE
);

-- Liste over registrerte brukere (uten passord)
CREATE VIEW registrerte_brukere AS
  SELECT id, brukernavn, epost, rolle, opprettet
  FROM studenter;