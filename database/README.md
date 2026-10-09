# Supabase database

The SQL files create and seed the portfolio tables. `03_static_site_policies.sql`
adds the access rules and Storage bucket needed when the website is hosted as a
static site and connects directly to Supabase from the browser.

## Supabase setup

1. In the Supabase SQL Editor, run `01_schema.sql`, then `02_seed.sql`.
2. Create the administrator under **Authentication → Users** and note the
   account email.
3. Replace `REPLACE_WITH_ADMIN_EMAIL` in `03_static_site_policies.sql` with that
   exact email, then run the file.
4. In project settings, copy the Project URL and the **publishable** API key.
   Never put a secret/service-role key in browser code or Vercel environment
   variables for this static site.

The third SQL file creates the public `portfolio-assets` bucket used for the
portrait, CV, and uploaded project thumbnails. Row Level Security permits
public visitors to read public portfolio content and submit inquiries. Only the
configured authenticated admin can change content or read/manage inquiries.

## Local static preview

Copy the root `.env.example` to `.env`, then set `SUPABASE_URL`,
`SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_ADMIN_EMAIL`. From the project root run
`npm install` and `npm start`, then open `http://localhost:4173`.

The build generates `dist/` and writes browser-visible configuration there.
The site does not need a Node server at runtime. Do not commit `.env` or `dist/`.
