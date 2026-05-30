# Digital Flipbook Reader

A simplified Next.js App Router app for uploading a PDF, choosing a reading theme, and generating a public flipbook reading link.

## Features

- Minimal `/admin` flow: upload PDF, select theme, generate link
- PDF validation with a 50MB max file size
- Supabase Storage upload to `flipbook-pdfs/books/{slug}.pdf`
- Supabase `flipbooks` table with only `id`, `slug`, `pdf_url`, `theme`, and `created_at`
- Public `/book/[slug]` reader page
- PDF rendering through `react-pdf` / PDF.js
- Realistic page flip animation through `react-pageflip`
- Fullscreen, next/previous controls, mobile swipe, and page number
- Reading themes: dark cinematic, light clean, premium magazine
- Render, Vercel, and Netlify-ready environment configuration

## Environment

Copy `.env.example` to `.env.local`:

```bash
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_KEY=replace-with-a-strong-admin-password
```

`SUPABASE_SERVICE_ROLE_KEY` must stay server-only. Do not expose it with a `NEXT_PUBLIC_` prefix.

For local UI testing, the app can run without Supabase in development. If Supabase values are blank, uploads are stored under `public/local-flipbooks` and metadata is stored in `.local-data/flipbooks.json`.

## Supabase Setup

Run the SQL in [supabase/schema.sql](/Users/sitharahussain/Documents/Codex/2026-05-30/build-a-full-next-js-app/supabase/schema.sql).

Create a public Storage bucket:

- Bucket name: `flipbook-pdfs`
- Public bucket: enabled
- Upload path used by the app: `books/{slug}.pdf`

If you use storage policies instead of a fully public bucket, allow public reads for objects in `flipbook-pdfs` and allow service-role writes.

## Local Development

```bash
npm install
npm run dev
```

The PDF.js worker is committed at `public/pdf.worker.min.mjs`. If you upgrade `react-pdf`, refresh it with:

```bash
cp node_modules/react-pdf/node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/pdf.worker.min.mjs
```

Open:

- Admin: `http://localhost:3000/admin`
- Reading links are generated after upload

## Deploy

### Render

This repo includes [render.yaml](/Users/sitharahussain/Documents/Codex/2026-05-30/build-a-full-next-js-app/render.yaml) for Blueprint deployment.

Render settings:

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Runtime: Node

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key for server-side upload and database writes
- `ADMIN_KEY`: password used by `/admin` when generating links
- `NEXT_PUBLIC_BASE_URL`: public Render URL, for example `https://your-service.onrender.com`

Deployment steps:

1. Push this project to a GitHub repository.
2. In Render, create a new Blueprint from the repository, or create a Web Service manually.
3. Use `npm install && npm run build` as the build command.
4. Use `npm start` as the start command.
5. Add all required environment variables above.
6. In Supabase, run [supabase/schema.sql](/Users/sitharahussain/Documents/Codex/2026-05-30/build-a-full-next-js-app/supabase/schema.sql).
7. Create a public Supabase Storage bucket named `flipbook-pdfs`.
8. Set `NEXT_PUBLIC_BASE_URL` to the final Render service URL after the first deploy.

For public book links to work in production, the `flipbook-pdfs` bucket must allow public reads because the reader loads the uploaded PDF from the stored public URL.

### Vercel

Set the environment variables from `.env.example` in Project Settings, then deploy normally.

### Netlify

Set the same environment variables in Site Configuration. The app uses standard Next.js routing and server APIs, so deploy with Netlify's Next.js runtime.
