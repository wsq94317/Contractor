# Contractor / Visitor Log

Multi-hotel contractor, visitor, and temporary access sign in / sign out system built with:

- Next.js
- TypeScript
- Tailwind CSS
- Prisma
- SQLite

## Features

- Total entry page with 4 hotel cards
- Hotel-specific home page with `Sign In`, `Sign Out`, and `Staff Log In`
- Public sign in form with required fields and contractor signature
- Public sign out form limited to currently open sign in records
- Dual-signature sign out flow for contractor and hotel staff
- Hotel-scoped staff login
- Admin record table with filters, detail page, create, edit, and soft delete
- Prisma seed data for 4 hotels and staff accounts

## Local setup

Install dependencies:

```bash
npm install
```

Create or update the database schema:

```bash
npm run db:migrate
```

Seed demo hotel and staff data:

```bash
npm run db:seed
```

Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Replacing hero placeholder images

Hotel home page hero images are stored in:

- `public/hotel-heroes/sydney-qvb.svg`
- `public/hotel-heroes/sydney-harbour-suites.svg`
- `public/hotel-heroes/sydney-cbd.svg`
- `public/hotel-heroes/melbourne-cbd.svg`

You can replace them in either of these ways:

- Overwrite the existing files with your final image files if you keep the same filename and path.
- Add a new image file under `public/hotel-heroes/` and update the path in `src/lib/constants.ts` under `hotelHeroImages`.

## Database notes

- SQLite file path is configured in `.env`
- Current database path: `C:/Users/bearp/AppData/Local/contractor-visitor-log/dev.db`
- `db:migrate` is the preferred setup path
- `db:push` is also available for quick schema sync during development

## Seeded hotels

- YEHS Hotel Sydney QVB
- YEHS Hotel Sydney Harbour Suites
- YEHS Hotel Sydney CBD
- YEHS Hotel Melbourne CBD
