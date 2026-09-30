# Yomna Ehab portfolio

This package contains the updated website. The public pages keep the original design. A small server stores shared content and inquiries and protects the Admin area.

## Run locally

1. Install Node.js 20 or newer.
2. Set a unique Admin password (12 or more characters).
3. In this folder run `npm start`.
4. Open `http://localhost:3000`. Open `http://localhost:3000/#admin` for Admin.

Examples of setting the password:

- macOS/Linux: `ADMIN_PASSWORD='your-long-unique-password' npm start`
- Windows PowerShell: `$env:ADMIN_PASSWORD='your-long-unique-password'; npm start`

Do not open `public/index.html` directly as a file; run the server. No extra packages are needed.

## What changed

- Contact submissions are stored on the server and appear under Admin → Contact → Inquiries. A success message appears only after the server accepts the message. This does not send an email notification.
- The Admin password is set on the server, never shown in the public HTML. Admin requests require a protected session. Change the password by updating `ADMIN_PASSWORD` and restarting the server.
- Admin edits and inquiries are stored in `data/site.json` and are shared with all visitors. Back up that file. Keep this folder on persistent storage when deploying.

For a public deployment, serve the site over HTTPS and set `COOKIE_SECURE=1` in the server environment. Keep `ADMIN_PASSWORD` and `data/site.json` private. The existing showreel, project videos and CV still need their real files or URLs supplied through Admin.
