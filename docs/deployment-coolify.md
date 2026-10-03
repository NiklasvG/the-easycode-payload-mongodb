# Hetzner / Coolify deployment

For self-hosted analytics, performance and uptime alternatives, see
[Monitoring on Coolify](monitoring-coolify.md).
For the configured Umami integration and runtime variables, see
[Umami setup](umami-coolify.md).

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
MONGODB_URI=mongodb://easycode_app:APP_PASSWORD@BUILD_REACHABLE_HOST:27017/easycode?authSource=easycode&replicaSet=rs0&directConnection=true
PAYLOAD_SECRET=YOUR_SECRET
UMAMI_SCRIPT_URL=https://YOUR_UMAMI_HOST/script.js
UMAMI_WEBSITE_ID=YOUR_UMAMI_WEBSITE_ID
```

Set these as **runtime only**, using actual credentials in Coolify:

```dotenv
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

Enable **Use Docker Build Secrets** in Coolify for `MONGODB_URI` and
`PAYLOAD_SECRET`. The Dockerfile requires these BuildKit secret IDs and does not
accept credentials as ordinary build arguments. If BuildKit secrets are missing,
the build fails instead of embedding credentials in the image.

The public URL, environment, optional bundler and Umami settings can also be
passed as BuildKit secrets. The Dockerfile explicitly mounts them because Coolify
does not automatically extend RUN commands that already contain secret mounts.
Both Umami variables need build and runtime scope: their values are included in
the prerendered page. The tracker still loads only after analytics consent.

MongoDB must be reachable from the build container, not just the runtime network.
Use a private address reachable by the builder; a runtime-only Docker service name
may not resolve during image builds. If build and runtime need different database
addresses, pass the builder address through the `MONGODB_URI` build secret and
keep the runtime URI for the application container. Both must target the same CMS.

The build reads published CMS content and prerenders complete pages with ISR.
Existing CMS hooks invalidate pages after publication, withdrawal, deletion and
changes to related content. Draft previews bypass the public page cache.
SMTP and Gemini still use non-delivering build placeholders.

Force the builder stage to run on each deployment that must reread CMS content.
For a custom Docker command use `--no-cache-filter builder` with `docker buildx
build`, or `--no-cache` with `docker build`; in Coolify use **Disable Build Cache**
or **Force deploy (without cache)**. Changed secret values and external database
content alone do not invalidate Docker layers.

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
