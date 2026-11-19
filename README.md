# Study Buddy

Study Buddy is a student study-group app for NTNU Gjøvik. Students can browse courses and scheduled study sessions, and create a session with a course, time, location, and participant limit. The interface also includes account registration and login, plus an admin form for adding courses.

## Features

- Register and log in with an NTNU email address.
- Browse available courses and scheduled study sessions.
- Create a study session with its course, date, start and end times, location, and maximum capacity.
- Add courses through the admin-facing settings form.
- Use a responsive interface served from the `public` directory.

## Requirements

- Node.js and npm
- MySQL

## Run locally

1. Clone the repository and install its dependencies:

   ```sh
   npm install
   ```

2. Create a MySQL user and configure the connection in a `.env` file at the project root:

   ```dotenv
   DB_HOST=localhost
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=study_buddy
   PORT=3000
   ```

   `PORT` is optional; the server defaults to `3000`.

3. Initialize the database by running `database/schema.sql` with MySQL. **This script drops and recreates the app's tables**, so do not run it against a database containing data you need to keep.

4. Start the server:

   ```sh
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000).

The optional `database/seed.sql` file contains sample courses and users. Its example passwords are stored as plaintext and are not compatible with the application's password-hash login flow; do not rely on those users to log in.

## API

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register an account (NTNU email required). |
| `POST` | `/api/auth/login` | Log in with email and password. |
| `GET` | `/api/courses` | List courses. |
| `POST` | `/api/courses` | Create a course. |
| `GET` | `/api/sessions` | List scheduled study sessions. |
| `POST` | `/api/sessions` | Create a study session. |

JSON request bodies are used for the API's `POST` routes. Course and session data are stored in MySQL.

## Project structure

- `server.js` — HTTP server, API routing, and static-file serving.
- `src/controllers/` — Authentication, course, and session handlers.
- `src/config/db.js` — MySQL connection configuration.
- `database/schema.sql` — Database and table definitions.
- `database/seed.sql` — Optional example data.
- `public/` — Frontend HTML, CSS, JavaScript, and assets.
