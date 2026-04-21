# AI SQL Assistant Frontend

Next.js frontend for the AI SQL Assistant UI.

## Prerequisites

- Node.js 20+
- npm 10+
- Backend running locally (`ai-sql-assistant-backend`)

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env
```

3. Confirm API URL in `.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Start frontend:

```bash
npm run dev
```

5. Open the app:

- [http://localhost:3000](http://localhost:3000)

## Scripts

- `npm run dev` - start dev server
- `npm run build` - build production bundle
- `npm run start` - run production server
- `npm run lint` - run eslint

## API Connection Behavior

- Frontend uses `NEXT_PUBLIC_API_URL` for all backend calls (`/query`, `/compile`, `/execute`, `/schema`).
- If `NEXT_PUBLIC_API_URL` is empty, the app falls back to demo mode with sample data.
- For full functionality, keep backend running on `http://localhost:8000` (or set your custom URL).

## Run on a Fresh Machine (Quick Checklist)

1. Start backend first (see backend README).
2. In this folder run:
   - `npm install`
   - `cp .env.example .env`
   - `npm run dev`
3. Open `http://localhost:3000`.
