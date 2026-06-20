# Online Book Review Application

Final project for the IBM / Coursera **Developing Back-End Apps with Node.js and Express** course.
A server-side REST API for an online book store with JWT + session-based authentication.

## Run

```bash
cd final_project
npm install
npm start          # starts the server on http://localhost:5000
```

## Architecture

| File | Responsibility |
| --- | --- |
| `index.js` | Express app, JSON parsing, session middleware, JWT auth guard on `/customer/auth/*` |
| `router/booksdb.js` | In-memory book database keyed by ISBN |
| `router/general.js` | Public endpoints (Tasks 1–6) + Axios/async methods (Tasks 10–13) |
| `router/auth_users.js` | Login + review add/modify/delete (Tasks 7–9) |

## Endpoints & graded tasks

### General users (no authentication)

| Task | Method & path | Description |
| --- | --- | --- |
| 1 / 10 | `GET /` | All books (async/await + Axios) |
| 2 / 11 | `GET /isbn/:isbn` | Book by ISBN (Promise + Axios) |
| 3 / 12 | `GET /author/:author` | Books by author (Promise + Axios) |
| 4 / 13 | `GET /title/:title` | Books by title (async/await + Axios) |
| 5 | `GET /review/:isbn` | Reviews for a book |
| 6 | `POST /register` | Register a new user |
| 7 | `POST /customer/login` | Log in (issues a JWT into the session) |

### Registered users (JWT required, under `/customer/auth/*`)

| Task | Method & path | Description |
| --- | --- | --- |
| 8 | `PUT /customer/auth/review/:isbn?review=...` | Add or modify your review |
| 9 | `DELETE /customer/auth/review/:isbn` | Delete your review |

## Example requests (curl)

```bash
# Task 1 - all books
curl http://localhost:5000/

# Task 2 - by ISBN
curl http://localhost:5000/isbn/1

# Task 3 - by author
curl http://localhost:5000/author/Unknown

# Task 4 - by title
curl "http://localhost:5000/title/Fairy tales"

# Task 5 - reviews for a book
curl http://localhost:5000/review/1

# Task 6 - register
curl -X POST http://localhost:5000/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"pass123"}'

# Task 7 - login (save the session cookie)
curl -X POST http://localhost:5000/customer/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"pass123"}' \
  -c cookies.txt

# Task 8 - add/modify a review (reuse the cookie)
curl -X PUT "http://localhost:5000/customer/auth/review/1?review=Great%20book" \
  -b cookies.txt

# Task 9 - delete your review
curl -X DELETE http://localhost:5000/customer/auth/review/1 \
  -b cookies.txt
```

> Authentication uses an `express-session` cookie scoped to `/customer` plus a
> JWT signed with `jsonwebtoken`. Use the same cookie jar (`-b cookies.txt`)
> for Tasks 8 & 9 after logging in.
