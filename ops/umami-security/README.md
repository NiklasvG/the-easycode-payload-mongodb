# Umami security image

Candidate prepared 2026-11-25. The released 3.5.0 image retains an affected Next version. This build uses the exact upstream source in source.json, whose upstream build check passed, with Node 22.23.5. All original upstream build steps remain intact. BuildKit verifies the pinned archive checksum.

GitHub builds and checks the runner image natively on AMD64 and exports a private artifact retained for three days. The exact checked image is imported into the existing private cxcr.eu namespace without recompilation. Coolify deploys its immutable digest through the existing production service after an isolated PostgreSQL restore/migration and application readiness test. Preserve the existing database, credentials, APP_SECRET, public tracking URLs and backups. Never configure APP_SECRET in this repository. The unused Coolify validation resources expose no public domains and receive no production secrets.

The source license is retained in UPSTREAM-LICENSE. Publication, backup/restore and actual runtime evidence are recorded in the central Coolify security report; this candidate file alone is not proof of deployment.

The existing Umami service runs on the AMD64 controller. Every external base stage explicitly targets linux/amd64. Promotion rejects an ARM64 image. The temporary QEMU package and the single owned x86-64 handler have been removed from the ARM64 builder after cancellation of the emulated builds.

The application bundle uses the supported Next.js `next build --webpack` fallback, retaining every preceding upstream build step, dependency, type check and runtime check. The exact upstream command is asserted before replacement; API/DB readiness is required after the build.

Both long emulated builds were cancelled. Official latest was rechecked as Umami 3.5.0 / Next 16.4.2 / Node 22.23.4; the official master tag is stale (3.0.0 / Next 15.5.3). The dedicated GitHub job therefore exports its checked, natively built AMD64 image as a private, short-lived artifact. That exact artifact is imported into the existing private cxcr.eu namespace; Coolify deploys the pinned digest through the existing service. No production data or secrets enter the image or artifact.


## Management gateway candidate

The separate gateway uses the same pinned AMD64 Node image and runs gateway.mjs without rebuilding the production image. Only GET/HEAD /script.js and POST/OPTIONS /api/send are public. All other routes require Basic authentication, followed by an eight-hour Secure, HttpOnly, SameSite=Strict signed session cookie. Basic is removed before forwarding; Umami Bearer headers pass unchanged. API clients first obtain the gateway cookie using Basic, then send that cookie with their Umami Bearer token. The cookie alone does not replace Umami authentication.

Credentials and the signing key are private Coolify service variables, never repository values. The existing domain points only to the gateway. Neither the gateway, app nor database publishes host ports. Tracking is limited to 20 requests/second per peer with burst 120; management to 2/second with burst 30. This is a candidate until isolated application and live HTTPS acceptance are recorded.
