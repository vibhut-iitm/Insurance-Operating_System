# Insurance-Operating_System

Sample insurance website and workspace built with Next.js. The public landing
page and enquiry form are for demonstration only; this project is not an
insurance provider and does not offer real coverage. Use test details only.

## Requirements

- Node.js 20.11 or newer
- The API from [`../conflict/`](../conflict/) for sign-in and enquiry handling

## Run locally

From this directory, install dependencies from the committed lockfile and start
the development server:

```powershell
npm ci
npm run dev
```

The site runs at `http://localhost:3000`. By default it connects to the API at
`http://localhost:4000/api`. To change that URL, copy `.env.example` to
`.env.local` and set `NEXT_PUBLIC_API_URL`.

For full database and API setup instructions, see the
[repository README](../README.md).
