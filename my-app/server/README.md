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

3. Run SQL migration to create bookings table (e.g. using psql):

```bash
psql "$DATABASE_URL" -f MIGRATE_CREATE_BOOKINGS.sql
```

4. Start the server:

```bash
pnpm start
```

Notes
-----
- The server exposes:
  - `POST /api/book` for creating a booking. The payload body should include `firstname`, `email`, `phone`, `company`, `date`, `time`.
   - `POST /api/book` for creating a booking. The payload body should include `firstname`, `email`, `phone`, `company`, `date`, `time` and an optional `freelancer` string to associate the booking with a freelancer.
  - `GET /api/bookings?date=YYYY-MM-DD` for fetching bookings of one day.
   - `GET /api/bookings?date=YYYY-MM-DD&freelancer=ID` for fetching bookings of a given day; adding `freelancer` filters results to that freelancer.
- Optional SMTP configuration can be set via env vars to send emails with nodemailer.

Email & admin copy
------------------
- The server can send email confirmations to the client who booked a slot (if SMTP is configured).
- You can set `ADMIN_EMAIL` in `.env` to receive a copy of every booking confirmation (handy for testing in staging environments).

Development tips
----------------
- If you prefer to test the app without Postgres, the frontend keeps a fallback storage in `localStorage` when the server is unreachable.
- To enable email notifications, configure the SMTP environment variables in `.env`. If the values are missing the API will still function but won't send emails.
