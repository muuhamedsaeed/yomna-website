# Yomna Ehab portfolio

The portfolio deploys to Vercel as a static website. It has no running Node
server or Vercel Functions. The browser reads and writes data directly through
Supabase's public API using a publishable key; Supabase Row Level Security
protects edits and private inquiries.

## One-time Supabase setup

1. Run `database/01_schema.sql` and `database/02_seed.sql` in the Supabase SQL
   Editor if you have not already done so.
2. Create the admin user under **Authentication → Users**. Use the email you
   want for the portfolio administrator and set its password.
3. In `database/03_static_site_policies.sql`, replace
   `REPLACE_WITH_ADMIN_EMAIL` with that exact email, then run the file in the
   SQL Editor. This sets the access rules and creates the public
   `portfolio-assets` Storage bucket.
4. In Supabase project settings, copy the Project URL and the **publishable**
   API key. Do not use a secret or service-role key in a static website.

## Build and preview locally

1. Copy `.env.example` to `.env` and fill in `SUPABASE_URL`,
   `SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_ADMIN_EMAIL`.
2. Run `npm install`, then `npm start`.
3. Open `http://localhost:4173`.

The build writes the static site into `dist/`. The generated Supabase settings
are public browser settings, so only the publishable key belongs there. Keep
`.env` private and out of Git.

## Publish on Vercel

1. Push the project to a Git repository and import that repository in Vercel.
2. In **Project Settings → Environment Variables**, add `SUPABASE_URL`,
   `SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_ADMIN_EMAIL` for Production (and
   Preview if desired).
3. Use the **Other** framework preset. The included `vercel.json` sets the build
   command to `npm run build` and the output directory to `dist`.
4. Deploy. Vercel serves the generated files as static assets; it does not run
   `server.js`.

If the Supabase tables already contain the seeded website data, this deploy
will use that data. After changing Vercel environment variables, redeploy so
the build can regenerate the public configuration.
