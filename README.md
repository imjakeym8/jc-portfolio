# JC Portfolio

Next.js portfolio using Poppins, served as a single-page site.

## Local development

Use Node.js 20 or later and npm. Run `npm ci`, then `npm run dev`, and open <http://localhost:3000>.

## Production check

Run `npm run check` and `npm audit --omit=dev --audit-level=high`. To test the production server locally, run `npm run start` after the build and open <http://localhost:3000>.

Deploy with a Node.js host that supports Next.js 15. Set the build command to `npm ci && npm run build` and the start command to `npm run start`. Configure the host's HTTPS domain before launch; this repository does not assume a canonical URL or deployment provider.
