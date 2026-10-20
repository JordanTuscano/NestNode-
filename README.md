# NestNode

A full-stack notes app with accounts, search, tags, pinning, archive and a stats dashboard.

**Stack:** MongoDB + NestJS (TypeScript) + React (Vite) + Node.js

## Run it

You need Node 18+ and MongoDB (local install or a free MongoDB Atlas cluster).

```bash
# Terminal 1 - API
cd backend
npm install
# edit .env if needed (MONGO_URI, JWT_SECRET)
npm run dev          # http://localhost:5000/api

# Terminal 2 - website
cd frontend
npm install
npm run dev          # http://localhost:5173
```

Open http://localhost:5173, create an account, and start adding notes.

## Features
- Register / login with JWT authentication (passwords hashed with bcrypt)
- Create, edit, delete notes with title, content, tags and a color
- Pin notes (pinned notes sort first) and archive / restore notes
- Live search (title + content) and tag filtering
- Dashboard: totals, notes per day (bar chart), top tags (pie chart), recently edited
- Dark / light mode, loading skeletons, toast messages, responsive layout
- Rate limiting (100 requests/min per IP) and input validation on the server

## How it fits together

```
React (browser)  --HTTP + JSON-->  NestJS API  --Mongoose-->  MongoDB
   pages/components                controllers -> services      users, notes
   axios + JWT header              guards, DTO validation       collections
```

### Backend (`backend/src`)
| Piece | Job |
|---|---|
| `main.ts` | Starts the app, sets the `/api` prefix, CORS and the validation pipe |
| `app.module.ts` | Root module: connects MongoDB, enables rate limiting, imports feature modules |
| `users/` | User schema (Mongoose) and a service to find/create users |
| `auth/` | Register, login, `/auth/me`; JWT strategy and guard |
| `notes/note.schema.ts` | Shape of a note in MongoDB |
| `notes/notes.dto.ts` | Rules for incoming data (class-validator) |
| `notes/notes.controller.ts` | Defines the routes (what URL does what) |
| `notes/notes.service.ts` | The real logic: queries, updates, dashboard aggregation |

**API routes** (all `/notes` routes need `Authorization: Bearer <token>`)

| Method | URL | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in, returns token |
| GET | `/api/auth/me` | Current user |
| GET | `/api/notes?search=&tag=&archived=` | List notes |
| GET | `/api/notes/stats` | Dashboard numbers |
| POST | `/api/notes` | Create note |
| PATCH | `/api/notes/:id` | Update (edit, pin, archive) |
| DELETE | `/api/notes/:id` | Delete note |

### Frontend (`frontend/src`)
| File | Job |
|---|---|
| `main.jsx` / `App.jsx` | Entry point and routes (`/`, `/archive`, `/dashboard`, `/login`, `/register`) |
| `AuthContext.jsx` | Holds the logged-in user; login, register, logout |
| `api.js` | axios setup; adds the JWT to every request |
| `pages/Notes.jsx` | Notes list, search, tags, create/edit/delete logic |
| `pages/Dashboard.jsx` | Stat cards and charts (Recharts) |
| `pages/Auth.jsx` | Login and register form |
| `components/` | `Layout` (sidebar), `NoteCard`, `NoteModal` |
| `styles.css` | All styling; colors live in CSS variables at the top |

## What happens when you click "Save note"
1. `NoteModal` collects the form values and calls `onSave`.
2. `Notes.jsx` sends `api.post('/notes', values)` with the JWT in the header.
3. NestJS runs the `JwtAuthGuard`, which checks the token and finds the user id.
4. `ValidationPipe` checks the body against `CreateNoteDto`.
5. `NotesController.create` calls `NotesService.create`, which saves to MongoDB with the user's id.
6. The API replies; React shows a toast and reloads the list.

## Questions your teacher might ask
- **Why NestJS instead of plain Express?** It enforces structure (modules, controllers, services), has built-in dependency injection and validation, and uses TypeScript.
- **How is authentication done?** The server checks the password with bcrypt and returns a signed JWT. The browser sends it on every request; a guard verifies it.
- **How do you keep users' notes private?** Every query filters by `user: userId` taken from the verified token, never from the request body.
- **What is a DTO?** A class describing the allowed shape of request data. The `ValidationPipe` rejects anything that does not match.
- **What is an aggregation pipeline?** A series of MongoDB stages (`$match`, `$group`, `$sort`) that compute results inside the database. `$facet` runs several in one query for the dashboard.
- **Why is the search debounced?** To avoid calling the API on every keystroke; it waits 250 ms after typing stops.

## Ideas to extend it
Markdown preview, reminders, drag and drop ordering, note sharing, image uploads, unit tests with Jest, and deployment (Render for the API, Vercel for the frontend, MongoDB Atlas for the database).
