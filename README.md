# taskflow-Himanshu-Balani

TaskFlow is a minimal, production-ready task management application built as a take-home engineering assignment.

## 1. Overview
TaskFlow allows users to authenticate, view their assigned projects, and manage tasks across a Kanban-style status workflow. 
**Tech Stack:**
- **Backend:** Node.js, TypeScript, Express, PostgreSQL, `zod` for validation.
- **Frontend:** React, TypeScript, Vite, TailwindCSS, React Router.
- **Infrastructure:** Docker Compose, `dbmate` (Migrations).

*Note on Language requirement:* The instructions noted Go was preferred but explicitly allowed candidates to "use a language you know well" if noted in the README. I chose a standard, production-grade **Node.js (TypeScript)** backend to deliver a highly robust implementation safely within the timeframe.

## 2. Architecture Decisions
- **Monorepo Structure:** Separation of concerns using isolated containers for Frontend (Nginx), Backend (Node), Postgres, and a one-time Migration executor (`dbmate`).
- **Database Migrations:** Used `dbmate` for database-agnostic, raw SQL migrations. It runs inside Docker automatically before the Node server starts, ensuring `0 manual steps`.
- **JWT Auth & Passwords:** Uses `bcrypt` (cost 12) for hashing. The JWT payload signs `{ id, email }` and expires in 24h. Handled using standard HTTP Authorization headers.
- **Frontend State:** I skipped complex state managers (like Redux/Zustand) and opted for standard React Context + lightweight Fetch abstractions for the auth system and optimistic UI updates to prevent bloated frontend bundles.
- **Optimistic UI:** When a task status changes, the React state immediately updates the Kanban view locally. If the network fails, it seamlessly re-fetches and reverts to correct the UI.

## 3. Running Locally
Ensure you have Docker and Docker Compose installed.

```bash
git clone https://github.com/himanshubalani/taskflow-Himanshu-Balani.git
cd taskflow-Himanshu-Balani

# Prepare environment variables
cp .env.example .env

# Spin up the infrastructure
docker compose up --build
```

- **App available at:** http://localhost:3000
- **API available at:** http://localhost:4000

## 4. Running Migrations
Migrations run **automatically on container start**. 

The `docker-compose.yml` includes a specific `migrate` service running `dbmate`. It waits for the PostgreSQL container to become healthy, executes all SQL files in `db/migrations/`, seeds the database, and exits successfully before the backend API server is allowed to boot. **Zero manual steps are required.**

## 5. Test Credentials
A database seed script automatically creates a test user so you can log in immediately.

```text
Email:    test@example.com
Password: password123
```

## 6. API Reference
Use Postman to check after running build steps! or use the UI!
All endpoints (except auth) require the header: `Authorization: Bearer <jwt_token>`.

### Auth Endpoints
**`POST /auth/register`**
- **Request:** `{ "name": "Jane", "email": "jane@example.com", "password": "password123" }`
- **Response (201):** `{ "token": "jwt...", "user": { "id": "uuid", "name": "Jane", "email": "jane@example.com" } }`

**`POST /auth/login`**
- **Request:** `{ "email": "jane@example.com", "password": "password123" }`
- **Response (200):** `{ "token": "jwt...", "user": { "id": "uuid", "name": "Jane", "email": "jane@example.com" } }`

### Projects Endpoints
**`GET /projects`**
- **Response (200):** `{ "projects":[ { "id": "uuid", "name": "Website", "description": "...", "owner_id": "uuid", "created_at": "..." } ] }`

**`POST /projects`**
- **Request:** `{ "name": "New Project", "description": "Optional" }`
- **Response (201):** Returns the created project object.

**`GET /projects/:id`**
- **Response (200):** `{ "id": "uuid", "name": "...", "tasks":[ { "id": "uuid", "title": "Design", "status": "todo", ... } ] }`

**`DELETE /projects/:id`**
- **Response (204):** No Content

### Tasks Endpoints
**`POST /projects/:id/tasks`**
- **Request:** `{ "title": "Setup CI", "priority": "high", "description": "Add Github actions" }`
- **Response (201):** Returns the created task object.

**`PATCH /tasks/:id`**
- **Request:** `{ "status": "in_progress" }`
- **Response (200):** Returns the updated task object.

**`DELETE /tasks/:id`**
- **Response (204):** No Content

*(Note: Validation errors return `400` with standard shape: `{ "error": "validation failed", "fields": { "email": ["Invalid email"] } }`)*

## 7. What You'd Do With More Time
- **Comprehensive Test Suite:** I would add integration tests using `Jest` and `Supertest` for the backend APIs using an ephemeral test database. For the frontend, I'd add `Vitest` with React Testing Library to verify component rendering and interactions.
- **Drag-and-Drop Interaction:** Currently, task progression is handled by clicking the task card to cycle statuses. With more time, I would implement fluid drag-and-drop functionality between Kanban columns using a library like `@dnd-kit/core`.
- **Shared Zod Types:** Instead of maintaining separate schemas and types for the frontend and backend, I would extract my Zod schemas into a shared `packages/types` workspace folder. This would guarantee 100% end-to-end type safety.
- **Pagination & Deep Linking:** I would implement cursor-based pagination for the projects list on the backend and map frontend filter states (like "assigned to me") to the URL parameters so views can be shared or bookmarked.
```