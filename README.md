# TerraBeegle

Fullstack web application created for the **Terranova Challenge** proposed at **42 Florence**.

## Tech Stack

- **Backend**: ASP.NET Core Web API on **.NET 10 LTS**
- **Frontend**: **Angular LTS** (Standalone Components, Signals & HttpClient)
- **Database**: **PostgreSQL 17** (via **Entity Framework Core** & **Npgsql**)
- **Orchestration**: Docker Compose, concurrently

## Available Scripts (`package.json`)

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the PostgreSQL database, .NET 10 backend, and Angular frontend concurrently. |
| `npm run backend` | Runs only the .NET 10 Web API (`Backend-TerraBeegle`). |
| `npm run frontend` | Runs only the Angular dev server with dev proxy (`frontend-TerraBeegle`). |
| `npm run db:up` | Starts the PostgreSQL container via Docker Compose (or local service fallback). |
| `npm run db:down` | Stops the PostgreSQL Docker container. |

---

## Database Credentials (Default)

- **Host**: `localhost` (Port: `5432`)
- **Database**: `terrabeegle_db`
- **Username**: `terrabeegle`
- **Password**: `terrabeegle_secret`
