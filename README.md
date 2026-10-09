# Simple Name Frontend

A minimal single-page React application that collects a full name and
submits it to a Django REST API via HTTP POST.

```
React  →  Django REST API  →  SQL Server
```

## Project structure

```
simple-name-frontend/
├── public/
├── src/
│   ├── components/
│   │   └── NameForm.jsx      # UI + validation + submit flow
│   ├── services/
│   │   └── api.js            # All HTTP communication lives here
│   ├── App.jsx
│   ├── main.jsx
│   └── styles/
│       └── app.css
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Requirements

* Node.js 18+
* A running Django REST API exposing `POST /api/names/`

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your local env file:

   ```bash
   cp .env.example .env
   ```

   By default it points at `http://127.0.0.1:8000` (a Django dev server
   running with `manage.py runserver`).

3. Start the dev server:

   ```bash
   npm run dev
   ```

   The app runs at `http://localhost:5173`.

## API contract

The frontend sends:

```
POST {VITE_API_BASE_URL}/api/names/
Content-Type: application/json

{ "full_name": "John Smith" }
```

Expected success response (message text is optional; a default is used
if the backend omits it):

```json
{ "message": "Name saved successfully." }
```

On validation failure, Django REST Framework's default error shape is
supported out of the box:

```json
{ "full_name": ["This field may not be blank."] }
```

## Environment variable

The API base URL is never hard-coded. It is read at build time from:

```
VITE_API_BASE_URL
```

* Local: `VITE_API_BASE_URL=http://127.0.0.1:8000`
* Production: `VITE_API_BASE_URL=https://api.example.com`

Switching environments never requires a source code change — only a
different `.env` file (or environment variable set on the EC2 host /
build pipeline) before running `npm run build`.

## Production build (AWS EC2 + Nginx)

1. Set the production API URL, either in a `.env.production` file or as
   an exported environment variable on the build machine:

   ```bash
   echo "VITE_API_BASE_URL=https://api.example.com" > .env.production
   ```

2. Build static assets:

   ```bash
   npm run build
   ```

   This produces a `dist/` folder containing static HTML/CSS/JS.

3. Serve `dist/` with Nginx (or copy it to the EC2 instance's web root).
   No Node.js process needs to run in production — it's static files.

## Notes

* No authentication, routing, or state management library is used —
  this is intentionally a single page with a single form, per the
  project's learning goals (React → HTTP POST → Django REST → MSSQL →
  AWS EC2/RDS).
* All HTTP calls live in `src/services/api.js`. Components never call
  `fetch()` or construct backend URLs directly.
