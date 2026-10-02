# Hetzner / Coolify deployment

## Staging first

- Branch: `staging`. Deploy to `https://staging.the-easycode.eu`.
- Use the new Hetzner MongoDB as the staging database initially. Never point
  staging at the existing production database or production upload directory.
- Give production its own database credentials and media volume before cutover.
- Leave the current website and Vercel Blob running until migration is verified.

## Application resource

- Git repository, branch `staging`, Dockerfile build pack.
- Repository root as build context; Dockerfile at `/Dockerfile`.
- Exposed container port: `3000`; listen address is `0.0.0.0`.
- Same Coolify destination network as MongoDB.
- Domain: the chosen HTTPS staging domain; create its DNS record first.
- Persist uploads in a named volume mounted at `/app/media`. Do not mount the
  entire `/app` directory. The runtime process has UID/GID `1001:1001`.
- Confirm upload-directory ownership after mounting. A host bind mount may need
  its ownership set to `1001:1001` once by a server administrator.

## Environment variables

Set these as **build and runtime** variables:

```dotenv
NEXT_PUBLIC_SERVER_URL=https://staging.the-easycode.eu
APP_ENV=staging
```

Set these as **runtime only**, using actual credentials in Coolify:

```dotenv
MONGODB_URI=mongodb://easycode_app:APP_PASSWORD@enywqhaqp7jekutyzcanpjqv:27017/easycode?authSource=easycode&replicaSet=rs0&directConnection=true
PAYLOAD_SECRET=YOUR_SECRET
PAYLOAD_UPLOAD_DIR=/app/media
PREVIEW_SECRET=YOUR_PREVIEW_SECRET
CRON_SECRET=YOUR_CRON_SECRET
SMTP_HOST=YOUR_SMTP_HOST
SMTP_PORT=587
SMTP_USER=YOUR_SMTP_USER
SMTP_PASS=YOUR_SMTP_PASSWORD
GEMINI_API_KEY=YOUR_GEMINI_KEY
```

Keep the existing `PAYLOAD_SECRET` when transferring the current installation.
Configure staging SMTP so test submissions cannot send unintended customer
emails. Vercel Blob credentials are no longer required by this branch.

The Docker build uses explicit non-production placeholders for required runtime
secrets. It does not require MongoDB access. Next.js frontend routes render at
request time; existing explicit CMS cache helpers remain in place. This changes
static prerendering behavior and should be checked under realistic traffic.

`APP_ENV=staging` adds `X-Robots-Tag: noindex, nofollow` and blocks crawling in
robots.txt. This is not access control: protect staging separately if it contains
private content. Set `APP_ENV=production` and the production URL for the final
production build.

## Optional migration rehearsal

1. Export a copy of the current MongoDB with `mongodump`. Restore **only** into
   the staging database. Preserve document IDs and relations, and exclude the
   source `admin`, `config`, and `local` databases and their users.
2. Copy Vercel Blob media to staging storage, including original files and all
   image variants. A database dump does not include media files.
3. Rewrite Blob-specific media URLs and any embedded URLs in the staging copy
   to Payload's local `/api/media/file/<filename>` endpoints. Disabling the Blob
   adapter does not migrate existing media or URL fields automatically.
4. Check frontend images, thumbnails, rich text, previews, downloads, and the
   relationships between pages, projects, clients and media.
5. Test login, edits, publishing, forms, AI chat, a new upload, and a redeploy.
   Verify that both database changes and uploaded files survive the redeploy.

Migration commands/scripts will be prepared separately for the actual source
database and Blob store. No migration has been executed by these code changes.

## Production cutover

- Configure off-server backups for MongoDB **and** media; test restoration.
- Address the MongoDB startup warnings (file descriptor limits, filesystem and
  kernel settings) on the Hetzner host before production use.
- Rehearse staging first, then freeze content changes briefly for a final copy
  into the separate production database and media storage.
- Deploy the verified branch/commit with production environment values.
- Pause automatic deployments on the old hosting platform before merging the
  storage changes into its watched branch. Keep its known-good deployment intact
  for rollback while the new production deployment is tested.
- Switch the public domain only after the production deployment passes checks.
- Keep the old deployment and source media available for rollback initially.

A single-member replica set supports transactions, but provides no server
failover. Container volumes are persistence, not backups.
