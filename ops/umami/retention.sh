#!/bin/sh
set -eu
# Fixed to the confirmed Easycode Umami database on the Coolify controller.
exec docker exec -i postgresql-pg71i1kdbqjyhh81knlksgoc sh -lc \
  'exec psql -X -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
  < /srv/the-easycode-umami-retention/retention.sql
