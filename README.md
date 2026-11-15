<div align="center">

<img src="frontend-TerraBeegle/public/Logo-dark.png" alt="TerraBeegle logo" width="140" />

# TerraBeegle

**A full-stack web application for exploring the world of video games.**

Built for the **Terranova Software – Gaming Explorer** challenge at **42 Florence**.

![.NET](https://img.shields.io/badge/.NET-10_LTS-512BD4?logo=dotnet&logoColor=white)
![ASP.NET Core](https://img.shields.io/badge/ASP.NET_Core-Web_API-512BD4)
![Angular](https://img.shields.io/badge/Angular-22-DD0031?logo=angular&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Swagger / OpenAPI](#swagger--openapi)
- [API Reference](#api-reference)
- [Security](#security)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Background Services](#background-services)
- [Project Structure](#project-structure)
- [Credits](#credits)

---

## Overview

TerraBeegle lets users search a large catalog of video games, filter and sort the results, open a detailed
page for each game and build a personal collection of favorites and a wishlist. On top of the mandatory features,
it has a complete account system: email verification, optional two-factor authentication, friends, reviews and
personal statistics.

Game data comes from the [IGDB Video Games Database API](https://api-docs.igdb.com/). The backend sits between
the frontend and IGDB, so the API key never reaches the browser.

---

## Features

### Mandatory features

| Feature | Description |
| :--- | :--- |
| **Home page** | Entry point with a search bar and a selection of games retrieved from the API. |
| **Basic search** | Search games by full or partial name; results update dynamically. |
| **Advanced search** | Filter by genre, theme, platform, release year, user rating and critic score, and sort by name, release date, rating or critic score. |
| **Game list** | Results shown as a responsive grid of cards: cover, title, release date, rating and platforms. |
| **Detail page** | Summary and storyline, screenshots and artworks, trailers, genres, platforms, companies, PEGI rating with its content descriptors, user rating, critic score, stores and websites, similar games. |
| **Favorites** | Add and remove games; the list is stored in the database and has its own page. |
| **State management** | Loading indicators, API error handling and "no results" messages. |
| **Responsive design** | Layout adapted to desktop, tablet and smartphone. |

### Bonus features

| Feature | Description |
| :--- | :--- |
| **User authentication** | Registration, login with JWT, email verification and password reset. |
| **Two-factor authentication** | Optional second step at login, with a one-time code sent by email. |
| **Dark / Light mode** | Theme preference saved on the user profile and restored on every visit. |
| **Wishlist** | A separate list of games the user wants to buy or try. |
| **Personal statistics** | Dashboard with the genre, platform and theme distribution of the user's favorites, plus an estimated playing style (singleplayer / multiplayer). |
| **Friends** | Send, accept, reject and remove friend requests; friends can see each other's lists. |
| **Reviews** | Users rate games from 1 to 10 (half stars) and can add a text. The reviews of a game are listed on its detail page; your own reviews are in the **Reviews** tab of the profile, where you can delete them. User ratings are averaged into the game rating. |
| **Instant feedback** | Adding a game to favorites or wishlist updates the heart immediately (optimistic update); if the server fails, the change is undone and an error is shown. |

---

## Architecture

```
┌──────────────────────┐      /api/*       ┌───────────────────────┐      HTTPS      ┌──────────────┐
│   Angular frontend   │ ────────────────▶ │  ASP.NET Core Web API │ ──────────────▶ │   IGDB API   │
│  (SSR, Bootstrap 5)  │ ◀──────────────── │       (.NET 10)       │ ◀────────────── │              │
└──────────────────────┘    JSON + JWT     └───────────┬───────────┘                 └──────────────┘
                                                       │ EF Core (Npgsql)
                                                       ▼
                                              ┌──────────────────┐        SMTP        ┌──────────────┐
                                              │  PostgreSQL 16   │                    │ Email server │
                                              └──────────────────┘                    └──────────────┘
```

- **Client–server separation:** the Angular app talks only to our API, never directly to IGDB.
- **Thin controllers, focused services:** everything about IGDB lives in `IGDBService`; email codes, 2FA,
  JWT generation and cleanup jobs each have their own service behind an interface.
- **DTOs everywhere:** entities never leave the backend; requests are validated with data annotations,
  responses are mapped with Mapster.
- **Lazy game caching:** a game is saved to the database only when a user adds it to a list or reviews it
  (`GetOrCreateGameAsync`), with all its data: genres, themes, platforms, companies, images, videos, websites,
  release dates, PEGI descriptors. Related games (similar games, DLCs, expansions, series...) are saved as
  lightweight **placeholders** (name, cover, rating) and become full games when someone saves them.
  Saved games are then served from the database instead of IGDB.
- **Serialized imports:** saving a game runs inside a transaction with a PostgreSQL advisory lock, so two
  imports at the same time cannot create the same genre, platform or image twice.
- **Production frontend in Docker:** the frontend container builds Angular in production mode (minified,
  lazy-loaded pages) and serves it with the SSR Express server, which also compresses the responses (gzip)
  and forwards `/api` to the backend.
- **Automatic migrations:** pending EF Core migrations are applied at startup.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | C#, ASP.NET Core Web API (.NET 10 LTS), Entity Framework Core 10, Npgsql, Mapster, MailKit, Swashbuckle (Swagger) |
| **Frontend** | Angular 22 (standalone components, signals, `HttpClient`, SSR), TypeScript 6, Bootstrap 5 |
| **Database** | PostgreSQL 16 |
| **Infrastructure** | Docker Compose, `concurrently` for local development |
| **External services** | IGDB Video Games Database API, SMTP (Gmail App Password) |

---

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) with Docker Compose
- Free [IGDB API credentials](https://api-docs.igdb.com/#account-creation) (a Twitch application: client ID + client secret)
- An SMTP account for sending emails (for example Gmail with an
  [App Password](https://support.google.com/accounts/answer/185833))

### 1. Configure the environment

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
| :--- | :--- |
| `USER_POSTGRES` / `PASSWORD_POSTGRES` / `DB_NAME` | PostgreSQL credentials and database name. |
| `IGDB_CLIENT_ID` / `IGDB_CLIENT_SECRET` | Your IGDB (Twitch) application credentials. |
| `JWT_KEY` | Secret used to sign the tokens, **at least 32 characters**. |
| `SMTP_HOST` / `SMTP_PORT` | SMTP server, e.g. `smtp.gmail.com` / `587`. |
| `SMTP_USER` / `SMTP_PASSWORD` | SMTP login (for Gmail, the App Password). |
| `SMTP_FROM` | Sender address, the same as `SMTP_USER` for Gmail. |

The backend refuses to start if the JWT key, the IGDB credentials or any SMTP setting is missing, so misconfiguration
is caught immediately instead of at the first request.

### 2. Run with Docker

```bash
docker compose up --build
```

| Service | URL |
| :--- | :--- |
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:5144 |
| Swagger UI | http://localhost:5144/swagger |
| OpenAPI JSON | http://localhost:5144/swagger/v1/swagger.json |
| Health check | http://localhost:5144/api/health |

- To start from an empty database: `docker compose down -v` and then `docker compose up --build`.
- The frontend container runs the **production build** (the one to use for Lighthouse), so it has no
  hot reload: after changing frontend code, run `docker compose up --build` again. For development with
  hot reload use `npm run frontend` (see below).
- Database migrations are applied automatically when the backend starts.

### Available npm scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts PostgreSQL, the backend and the frontend together. |
| `npm run backend` | Runs only the .NET Web API. |
| `npm run frontend` | Runs only the Angular dev server (with the API proxy). |
| `npm run db:up` / `npm run db:down` | Starts / stops the PostgreSQL container. |
| `npm run install:all` | Installs all npm and NuGet dependencies. |

---

## Swagger / OpenAPI

The backend publishes interactive API documentation with Swashbuckle.

| What | Path |
| :--- | :--- |
| Swagger UI | [`/swagger`](http://localhost:5144/swagger) → http://localhost:5144/swagger |
| OpenAPI document | [`/swagger/v1/swagger.json`](http://localhost:5144/swagger/v1/swagger.json) |

- Swagger is enabled only when `ASPNETCORE_ENVIRONMENT` is `Development`, which is what `docker-compose.yml` sets.
- To call the 🔒 endpoints: log in with `POST /api/auth/login`, copy the `token` from the response, press
  **Authorize** in Swagger UI and paste it (Swagger adds the `Bearer` prefix).
- Swagger is reachable only on the backend port (`5144`), not through the frontend (`4200`).

---

## API Reference

All endpoints are under `/api`. Requests and responses use JSON, and enums are sent as text
(`"Dark"`, `"Husky"`, `"Accepted"`).

**Legend:** 🔓 public · 🔒 requires `Authorization: Bearer <token>` · ⏱️ rate limited (see [Rate Limiting](#rate-limiting))

### Pagination

Every list endpoint accepts `page` (default `1`) and `pageSize` (default `24`, max `500`, the IGDB limit)
and returns the same envelope:

```json
{
  "items": [],
  "page": 1,
  "pageSize": 20,
  "totalCount": 134,
  "totalPages": 7,
  "previousPageUrl": null,
  "nextPageUrl": "/api/games?name=witcher&page=2"
}
```

The page links are built by our API with our own parameter names, so they keep the current filters.

### Authentication — `/api/auth`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | 🔓 ⏱️ | Creates an account and sends an 8-character verification code by email. Returns `201` without a token. |
| `POST` | `/auth/login` | 🔓 ⏱️ | Logs in with email or username and password. An unverified account must also send the `code`. With 2FA enabled, returns a `challengeToken` instead of the JWT. |
| `POST` | `/auth/login/2fa` | 🔓 ⏱️ | Completes a 2FA login with `challengeToken` + `code` and returns the JWT. |
| `POST` | `/auth/login/2fa/resend` | 🔓 ⏱️ | Sends a new 2FA code for an active login challenge. |
| `POST` | `/auth/resend-email` | 🔓 ⏱️ | Sends a new email verification code. |
| `POST` | `/auth/forgot-password-request` | 🔓 ⏱️ | Sends a password reset code by email. |
| `PATCH` | `/auth/forgot-password` | 🔓 ⏱️ | Sets a new password using the reset code. |

<details>
<summary><b>Login flow</b></summary>

```
POST /api/auth/login { emailOrUsername, password, code? }
│
├─ wrong credentials ─────────────────────────────▶ 401
├─ email not verified, no code ───────────────────▶ 403 (show the code field)
├─ email not verified, wrong / expired code ──────▶ 400
├─ 2FA disabled ──────────────────────────────────▶ 200 { token, user }
└─ 2FA enabled ───────────────────────────────────▶ 200 { requires2FA: true, challengeToken }
                                                         │
          POST /api/auth/login/2fa { challengeToken, code }
          ├─ wrong code ────────────────────────────▶ 400 (stay on the code screen)
          ├─ expired / too many attempts ───────────▶ 401 (back to the password)
          └─ correct code ──────────────────────────▶ 200 { token, user }
```

The verification code is checked **after** the password, so only the account owner can use up its attempts.
`resend-email` and `forgot-password-request` give the same answer whether the email exists or not, so they
cannot be used to find out who is registered.

</details>

### Users — `/api/users`

The current user is always taken from the token, never from the URL, so a user can only change their own account.

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/users` | 🔒 | Paginated list of users (public profile only). |
| `GET` | `/users/search?username=` | 🔒 | Case-insensitive prefix search by username, paginated. |
| `GET` | `/users/{username}` | 🔓 | Public profile: id, username, image |
| `GET` | `/users/{username}/profile` | 🔒 | Full profile of the logged-in user (email, theme, 2FA status, …). |
| `PATCH` | `/users` | 🔒 ⏱️ | Partial update: name, family name, username, profile image, theme |
| `PATCH` | `/users/password` | 🔒 ⏱️ | Changes the password (requires the old one). |
| `PATCH` | `/users/email` | 🔒 ⏱️ | Starts an email change: a code is sent to the **new** address (requires the password). |
| `POST` | `/users/email/confirm` | 🔒 ⏱️ | Confirms the new email with the code; only then the email is replaced. |
| `POST` | `/users/2fa/enable` | 🔒 ⏱️ | Enables two-factor authentication (requires the password and a verified email). |
| `POST` | `/users/2fa/disable` | 🔒 ⏱️ | Disables 2FA (requires the password) and invalidates active login challenges. |
| `DELETE` | `/users` | 🔒 ⏱️ | Deletes the account with its friendships, reviews and lists. |

Unverified accounts are hidden everywhere: they do not appear in lists, searches or profiles.

### Games — `/api/games`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/games` | 🔓 | Searches the IGDB catalog with filters, sorting and pagination. Returns game cards. |
| `GET` | `/games/{igdbGameId}` | 🔓 | Game details by IGDB id: from our database if saved, otherwise from IGDB. |
| `GET` | `/games/{slug}` | 🔓 | Same as above, by IGDB slug (e.g. `/games/the-witcher-3-wild-hunt`). |
| `GET` | `/games/coming-soon` | 🔓 | Games released in the next `months` (default 6, max 24), with the same name / platform / genre filters. |
| `GET` | `/games/all` | 🔓 | Games saved in our database (paginated); `includePlaceholders=true` also lists the placeholders. |

### Filter lists — `/api`

Used by the sidebar. Loaded from IGDB and cached in memory for 24 hours.

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/genres` | 🔓 | All IGDB genres (`id`, `name`, `slug`), sorted by name. |
| `GET` | `/themes` | 🔓 | All IGDB themes. |
| `GET` | `/platforms` | 🔓 | All IGDB platforms. |

<details>
<summary><b>Search parameters for <code>GET /api/games</code></b></summary>

| Parameter | Example | Description |
| :--- | :--- | :--- |
| `name` | `witcher` | Full or partial game name (case-insensitive). `searchExact`, `searchStartExact`, `caseSensitive` change the match. |
| `genres` / `themes` / `keywords` | `12&genres=31` | IGDB ids. By default the game must have **all** of them (`genresExact=false` = at least one). |
| `platforms` / `platformsFamily` | `6` / `1` | IGDB platform / platform family ids. |
| `developers` / `publishers` | `908` | IGDB company ids. |
| `gameType` | `0` | IGDB game type ids (main game, DLC, expansion...). |
| `pegiRating` | `11` | PEGI rating category ids (8–12). |
| `releaseYearMin` / `releaseYearMax` | `2015` / `2020` | Release year range. |
| `ratingMin` / `ratingMax` | `7.5` / `10` | User rating **out of 10** (decimals allowed); converted to the IGDB 0–100 scale. |
| `criticRatingMin` / `criticRatingMax` | `80` / `100` | Critic score out of 100. |
| `minRatingCount` / `minCriticRatingCount` | `300` / `5` | Minimum number of votes / critic reviews (`0` = no minimum), so a game rated 100 by two people does not top the list. |
| `sortBy` | `rating` | `name`, `released`, `rating` or `critic_rating`. |
| `ascending` | `false` | Sort direction (default `true`). |
| `page` / `pageSize` | `2` / `24` | Pagination. |

Ratings in the responses are always **out of 100**, like IGDB, both for games from IGDB and for games saved in
our database.

</details>

### Favorites & Wishlist — `/api/users/{userId}`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/users/{userId}/favorites` | 🔒 | The user's favorites, sorted by name, paginated. |
| `POST` | `/users/{userId}/favorites/{ApiGameId}` | 🔒 ⏱️ | Adds a game to favorites. |
| `DELETE` | `/users/{userId}/favorites/{ApiGameId}` | 🔒 ⏱️ | Removes a game from favorites. |
| `GET` | `/users/{userId}/wishlist` | 🔒 | The user's wishlist, sorted by name, paginated. |
| `POST` | `/users/{userId}/wishlist/{ApiGameId}` | 🔒 ⏱️ | Adds a game to the wishlist. |
| `DELETE` | `/users/{userId}/wishlist/{ApiGameId}` | 🔒 ⏱️ | Removes a game from the wishlist. |

- **Privacy:** a list can be viewed only by its owner and by accepted friends (otherwise `403`).
  Only the owner can change it.
- **First add of a game:** if the game is not in our database yet, it is downloaded from IGDB and saved first
  (about 1–2 seconds); the frontend already shows it as added.
- **Idempotent:** adding a game that is already in the list returns `204`, like the first time.

### Friendships — `/api/users/friendship`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/users/friendship/friends` | 🔒 | Accepted friends, paginated. |
| `GET` | `/users/friendship/received` | 🔒 | Pending requests received. |
| `GET` | `/users/friendship/sent` | 🔒 | Pending requests sent. |
| `POST` | `/users/friendship` | 🔒 ⏱️ | Sends a friend request. |
| `PATCH` | `/users/friendship` | 🔒 ⏱️ | Accepts or rejects a request (receiver only). |
| `DELETE` | `/users/friendship/{id}` | 🔒 ⏱️ | Removes a friend or cancels a sent request. |

Each pair of users has a single friendship row, stored in a fixed order (smaller id first), so duplicate or
crossed requests are impossible.

### Reviews

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/games/{igdbGameId}/reviews` | 🔓 | Reviews of a game with their author, newest first, paginated. |
| `POST` | `/games/{igdbGameId}/reviews` | 🔒 ⏱️ | Writes a review: `rating` 1–10 and optional `content`. One review per user and game (`409` for a second one). Unreleased games cannot be reviewed. |
| `PATCH` | `/games/{igdbGameId}/reviews` | 🔒 ⏱️ | Edits your own review (`id`, `rating`, optional `content`). |
| `DELETE` | `/games/{igdbGameId}/reviews/{id}` | 🔒 ⏱️ | Deletes your own review. |
| `GET` | `/user/{username}/reviews` | 🔓 | All reviews written by a user, with the game (name, cover, IGDB id), newest first. |

Every review updates the average rating of the game (create, edit and delete).

### Health

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | 🔓 | Returns `Healthy` with a timestamp, to check that the API is running. |

---

## Security

| Measure | Details |
| :--- | :--- |
| **JWT authentication** | Signed tokens (HMAC, key ≥ 32 characters) with issuer, audience and lifetime validation. Valid for 60 minutes. |
| **Password hashing** | ASP.NET Core Identity `PasswordHasher` (PBKDF2 with salt). Strong password policy: uppercase, lowercase, digit and special character, at least 8 characters. |
| **Email verification** | 8-character codes from a cryptographically secure generator, without ambiguous characters (`0/O`, `1/I/L`). Only a SHA-256 hash is stored; codes expire after 15 minutes and allow 5 attempts. Comparison in constant time. |
| **Two-factor authentication** | Optional. Every login attempt gets its own challenge (random 64-character token + code, both stored hashed). The code lasts 5 minutes, the challenge 15, max 5 attempts, single use, protected against two simultaneous requests. |
| **Safe account changes** | Changing the email, the password or the 2FA status requires the current password, so a stolen token alone cannot take over the account. The new email is saved only after it is confirmed. |
| **No user enumeration** | Password reset and code resend return the same answer for any email. Login gives the same error for an unknown user and a wrong password. |
| **Secrets** | All keys and passwords come from environment variables (`.env`, not committed). The IGDB key stays on the server and is never written to logs or responses. |
| **Race conditions** | Unique constraints in the database plus handling of `UniqueViolation`, so simultaneous requests get `409` instead of `500`. |
| **CORS** | Only the Angular origin (`localhost:4200`) is allowed. |

---

## Rate Limiting

Every endpoint that writes data or sends an email is protected by a **fixed-window** rate limiter, built into ASP.NET Core.

- **Per IP** for public endpoints, where there is no token.
- **Per user** (the `sub` claim of the JWT) for authenticated endpoints, so the limit follows the account
  across networks. The limiter runs after authentication, so a request without a token gets `401`
  without using up the limit.

| Policy | Limit | Partition | Used by |
| :--- | :---: | :---: | :--- |
| `login` | 5 / 1 min | IP | `POST /auth/login` |
| `register` | 5 / 1 min | IP | `POST /auth/register` |
| `resend-email` | 3 / 10 min | IP | `POST /auth/resend-email` |
| `forgot-password-request` | 3 / 10 min | IP | `POST /auth/forgot-password-request` |
| `forgot-password` | 5 / 1 min | IP | `PATCH /auth/forgot-password` |
| `login-two-factor` | 5 / 1 min | IP | `POST /auth/login/2fa` |
| `login-two-factor-resend` | 3 / 10 min | IP | `POST /auth/login/2fa/resend` |
| `change-email` | 3 / 10 min | User | `PATCH /users/email` |
| `confirm-email` | 5 / 1 min | User | `POST /users/email/confirm` |
| `change-password` | 5 / 1 min | User | `PATCH /users/password` |
| `two-factor` | 5 / 1 min | User | `POST /users/2fa/enable`, `/disable` |
| `user-write` | 30 / 1 min | User | Profile update, account deletion, friendships, reviews |
| `user-games` | 30 / 1 min | User | Adding / removing favorites and wishlist games |

When a limit is reached, the API answers `429 Too Many Requests` with a `Retry-After` header and a message
that gives the real waiting time:

```json
{
  "status": 429,
  "title": "Too many requests",
  "detail": "Too many requests. Try again in 8 minutes."
}
```

Policy names are `const` fields in `RateLimitPolicies`, so a misspelled policy name is a compile error instead of a runtime `500`.

---

## Error Handling

| Status | Meaning |
| :---: | :--- |
| `400` | Invalid input or wrong / expired code. |
| `401` | Missing or invalid token, wrong credentials, expired login challenge. |
| `403` | Logged in, but not allowed (e.g. someone else's list, unverified email at login). |
| `404` | Resource not found. |
| `409` | Conflict (username or email already taken, friendship already exists, game already reviewed). |
| `429` | Rate limit reached. |
| `503` | IGDB is unreachable. |

- Error messages written by us are returned as plain text.
- Errors generated by ASP.NET Core (validation errors, empty `401` / `403` / `404`, `500`) are returned as
  [`ProblemDetails`](https://www.rfc-editor.org/rfc/rfc9457) JSON. Validation errors list every invalid field at once.
- A **global exception handler** logs the full error and returns a clean `500` without stack traces.

---

## Background Services

| Service | Schedule | Purpose |
| :--- | :---: | :--- |
| `UnverifiedUserCleanupService` | Every hour | Deletes accounts whose email was not verified within 2 days. |
| `ExpiredLoginChallengeCleanupService` | Every hour | Deletes abandoned 2FA login challenges. |

---

## Project Structure

```
TerraBeegle/
├── Backend-TerraBeegle/          ASP.NET Core Web API
│   ├── Controllers/              Auth, User, Game, Filters, UserGames, Friendship, Review
│   ├── Services/                 IGDB client and mapping (IGDBToGameDTO, DBToGameDTO), game import
│   │                             (SaveGames, SaveGameContents, SaveMedia, SavePlatforms, SaveCompanies),
│   │                             JWT, email, verification codes, 2FA, cleanup jobs
│   ├── RateLimiting/             Policy names and partitioning helpers
│   ├── Models/                   EF Core entities
│   ├── DTOS/                     Request / response contracts
│   ├── Data/                     AppDbContext and one configuration file per entity
│   ├── Migrations/               EF Core migrations
│   ├── Enums/                    Theme, FriendshipStatus, IGDB IDs, …
│   └── milestone.md              Development log: issues found, decisions taken and why
├── frontend-TerraBeegle/         Angular application
│   ├── src/app/views/            Pages: catalog, game details (with reviews), favorites, wishlist,
│   │                             friend lists, profile (details, statistics, reviews, friends, settings), login, …
│   ├── src/app/services/         HTTP services (auth, games, filters, favorites, friends, reviews)
│   ├── src/app/ui/               Shared UI: theme, spinner, liquid glass, alerts, review popup
│   ├── src/server.ts             SSR server: static files, gzip, /api proxy to the backend
│   └── public/                   Static assets (logo)
├── docs/                         Challenge specification (EN / IT)
├── docker-compose.yml            PostgreSQL + backend + frontend
└── .env.example                  Environment variables template
```

---

## Credits

- **Game data:** [IGDB Video Games Database API](https://api-docs.igdb.com/).
- Project developed for the **Terranova Challenge** at **42 Florence**.
