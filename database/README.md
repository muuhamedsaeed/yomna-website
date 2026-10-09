# Supabase database

This folder contains a Supabase-ready schema and a seed generated from the current
`data/site.json` content.

## Setup

1. Create a Supabase project.
2. Open **SQL Editor** and run `01_schema.sql`, then `02_seed.sql`.
3. Create a public Storage bucket named `portfolio-assets`.
4. Upload `storage/portrait.png` to that bucket. Copy its public URL, then update
   the `portrait` row in `site_config` with that URL.

The source JSON has a portrait but no CV file. The portrait is stored as an image
asset in Supabase Storage rather than as base64 text in a database row.

## Tables and imported data

The schema creates nine tables: `site_config`, `skills`, `software`, `brands`,
`career`, `projects`, `contact_project_types`, `contact_budget_options`, and
`inquiries`. The seed contains the site's text settings, 14 skills, 8 software
tools, 6 brands, 5 career entries, 24 projects, both contact option lists, and
the one inquiry already present in `data/site.json`.

The source currently has five career entries (not six). The inquiry seed retains
the contact details and message from the local site data. Inquiry rows have no
public read, update, or delete policy. The site uses a server-only Supabase
secret key to manage the admin inbox; never put that key in browser code.

The seed is intended for initial import. Its upserts refresh portfolio content
from `data/site.json` if run again.

## Connect and run the website locally

1. In Supabase, copy the **Project URL** and create or copy a server-side
   **Secret API key** from the project's API keys settings. Do not use the
   database password as the website API key.
2. In the project root, copy `.env.example` to `.env` and fill in
   `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, and a unique `ADMIN_PASSWORD`.
3. Run `npm start` from the project root and open `http://localhost:3000`.

The server checks the Supabase connection before starting. The browser continues
to call the website's existing `/api/...` routes; the Node server reads and
writes the Supabase tables. It no longer uses `data/site.json` as its live store.
