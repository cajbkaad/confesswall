# RugWall Backend

Next.js + Prisma + PostgreSQL backend for the X-only RugWall MVP.

## What It Does

- Stores community-submitted X account + token reports.
- Aggregates reports into one profile per X handle.
- Supports anonymous votes and comments.
- Uses anonymous user IDs plus hashed IP/user-agent data for basic rate limiting.
- Calculates a simple Community Score from report count, token count, votes, comments, and freshness.

## Environment

Create `.env` from `.env.example`:

```env
DATABASE_URL="your_neon_postgres_connection_string"
DIRECT_URL="your_neon_direct_connection_string"
SERVER_SECRET_SALT="your_secret_salt"
```

Do not commit `.env`.

## Install

```bash
npm install
```

## Create Database Tables

```bash
npx prisma migrate dev --name init
```

## Run Dev Server

```bash
npm run dev
```

Default URL:

```text
http://localhost:3000
```

## API

### List Profiles

```text
GET /api/profiles?q=&filter=&page=1&limit=20
```

Filters:

```text
all
trending
watchlisted
multi
new
disputed
```

### Profile Details

```text
GET /api/profiles/:handle
```

Example:

```text
GET /api/profiles/AlphaCalls
```

### Submit Report

```text
POST /api/reports
```

Body:

```json
{
  "xHandle": "@AlphaCalls",
  "tokenSymbol": "$MOONPULSE",
  "tokenAddress": "A9f3...pump",
  "chain": "Solana",
  "reportType": "LP pulled",
  "description": "Promoted before the token dropped.",
  "evidenceUrl": "https://example.com",
  "anonymousUserId": "00000000-0000-4000-8000-000000000000"
}
```

### Vote

```text
POST /api/profile-votes/:handle
```

Body:

```json
{
  "anonymousUserId": "00000000-0000-4000-8000-000000000000"
}
```

### Comment

```text
POST /api/profile-comments/:handle
```

Body:

```json
{
  "content": "I saw this X account promote the token before it dropped.",
  "anonymousUserId": "00000000-0000-4000-8000-000000000000"
}
```

## Anonymous Identity

The frontend should generate and store:

```js
const key = "rugwall-anonymous-id";
let anonymousUserId = localStorage.getItem(key);

if (!anonymousUserId) {
  anonymousUserId = crypto.randomUUID();
  localStorage.setItem(key, anonymousUserId);
}
```

The backend stores:

```text
anonymous_user_id
ip_hash = sha256(ip + SERVER_SECRET_SALT)
user_agent_hash = sha256(user_agent + SERVER_SECRET_SALT)
```

IP is used as a spam-control signal, not proof of a unique person.
