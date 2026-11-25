# Umami security image

Candidate prepared 2026-11-25. The released 3.5.0 image retains an affected Next version. This build uses the exact upstream source in source.json, whose upstream build check passed, with Node 22.23.5. All original upstream build steps remain intact. BuildKit verifies the pinned archive checksum.

GitHub checks the runner image. Coolify builds the artifact target on the ARM64 builder and publishes it in cxcr.eu. Its separate build resource exposes no domain and receives no production secrets. The Umami production service must explicitly run `sh scripts/start-docker.sh`; the artifact default only sleeps. Promote an immutable digest after an isolated PostgreSQL restore/migration and application readiness test. Preserve the existing database, credentials, APP_SECRET, public tracking URLs and backups. Never configure APP_SECRET in this repository.

The source license is retained in UPSTREAM-LICENSE. Publication, backup/restore and actual runtime evidence are recorded in the central Coolify security report; this candidate file alone is not proof of deployment.

The existing Umami service runs on the AMD64 controller. Every external base stage explicitly targets linux/amd64, so the ARM64 Coolify builder requires its narrowly configured x86-64 QEMU handler. Promotion rejects an ARM64 image.
