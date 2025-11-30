Server (Express + Postgres)
===========================

Quick start
-----------

1. Copy `.env.example` to `.env` and set `DATABASE_URL`.
2. Install dependencies:

```bash
cd server
pnpm install
```

3. Run SQL migration to create bookings & freelancers table (e.g. using psql):

```bash
psql "$DATABASE_URL" -f MIGRATE_FREELANCERS_AND_BOOKINGS.sql
```

4. Start the server:

```bash
pnpm start
```

Notes
-----
- The server exposes:
  - `POST /api/book` for creating a booking. The payload body should include `firstname`, `email`, `phone`, `company`, `start_ts` (ISO), `duration_minutes` and an optional `freelancer`.
    - `POST /api/book` for creating a booking. The payload body should include `firstname`, `email`, `phone`, `company`, `start_ts` (ISO), `duration_minutes` and an optional `freelancer`.
  - `GET /api/bookings?date=YYYY-MM-DD` for fetching bookings of one day.
   - `GET /api/bookings?date=YYYY-MM-DD&freelancer=ID` for fetching bookings of a given day; adding `freelancer` filters results to that freelancer.
- Optional SMTP configuration can be set via env vars to send emails with nodemailer.

Additional endpoints & upload
----------------------------
- `GET /api/freelancers` : list freelancers
- `GET /api/freelancers/:id` : get a single freelancer by id
- `POST /api/freelancers` : create
- `PUT /api/freelancers/:id` : update
- `DELETE /api/freelancers/:id` : delete
- `POST /api/freelancers/upload` : upload avatar (multipart), returns `{ url }`

Notes about admin protection
--------------------------
These endpoints are protected by a shared `ADMIN_KEY` environment variable. Set `ADMIN_KEY` in your `.env` file and then provide it in requests with either `Authorization: Bearer <ADMIN_KEY>` or `x-admin-key: <ADMIN_KEY>` header.

JWT authentication
------------------
This server also supports JWT-based admin authentication for improved security. Set a `JWT_SECRET` in your `.env` file. Admin users can login at `POST /api/admin/login` (email & password) and receive a token. Use that token in the `Authorization: Bearer <token>` header to access admin endpoints.

Create initial admin user
-------------------------
To create the first admin user (server bootstrapped), you can call the protected `POST /api/admin/users` endpoint and authenticate with the `ADMIN_KEY` (or create a user through the DB directly). Example request:

```bash
curl -X POST $API_URL/api/admin/users -H "Content-Type: application/json" -H "Authorization: Bearer $ADMIN_KEY" -d '{"email":"admin@example.com","password":"ch4ngeM3","name":"Admin"}'

# or use the helper script (server/tools/create-admin.js):
cd server
pnpm install
pnpm run create-admin -- --email admin@example.com --password ch4ngeM3 --name Admin

Seed useful data
----------------
You can also seed sample freelancers & bookings with a helper script:

```bash
cd server
pnpm install
pnpm run seed
```
```

You can then login via `POST /api/admin/login` using the created email & password, and use the returned JWT to call admin endpoints.

Auth for users
--------------
Regular users can also register and login to obtain a JWT. Endpoints:
- `POST /api/auth/register` — body: `{ email, password, name }` returns `{ token }` and user info.
- `POST /api/auth/login` — body: `{ email, password }` returns `{ token }` and user info.
- `GET /api/auth/me` — returns `{ user }` when providing `Authorization: Bearer <token>` header.

Email & admin copy
- The server can send email confirmations to the client who booked a slot (if SMTP is configured).
- The confirmation email includes a cancellation link generated when creating the booking. The link uses `SERVER_BASE_URL` if set in the environment, otherwise it falls back to `http://localhost:<PORT>`.
- You can set `ADMIN_EMAIL` in `.env` to receive a copy of booking confirmations (handy for testing in staging environments).

Development tips
----------------
- If you prefer to test the app without Postgres, the frontend keeps a fallback storage in `localStorage` when the server is unreachable.
- To enable email notifications, configure the SMTP environment variables in `.env`. If the values are missing the API will still function but won't send emails.
