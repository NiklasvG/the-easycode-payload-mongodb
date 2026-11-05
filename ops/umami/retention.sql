\set ON_ERROR_STOP on
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
SELECT pg_advisory_xact_lock(hashtext('easycode-umami-retention-7d8fb646'));
DO $$ BEGIN
  IF (SELECT count(*) FROM website WHERE website_id = '7d8fb646-d5ab-403b-b2a0-96f68c8d8a4d') <> 1 THEN
    RAISE EXCEPTION 'Expected Easycode website is missing; no retention changes permitted';
  END IF;
END $$;
CREATE TEMP TABLE retention_counts (table_name text, removed bigint) ON COMMIT DROP;
WITH removed AS (
  DELETE FROM event_data d WHERE d.website_id = '7d8fb646-d5ab-403b-b2a0-96f68c8d8a4d'
    AND (d.created_at < NOW() - INTERVAL '180 days' OR EXISTS (
      SELECT 1 FROM website_event e WHERE e.website_id = d.website_id AND e.event_id = d.website_event_id AND e.created_at < NOW() - INTERVAL '180 days'
    )) RETURNING 1
) INSERT INTO retention_counts SELECT 'event_data', count(*) FROM removed;
WITH removed AS (
  DELETE FROM website_event WHERE website_id = '7d8fb646-d5ab-403b-b2a0-96f68c8d8a4d' AND created_at < NOW() - INTERVAL '180 days' RETURNING 1
) INSERT INTO retention_counts SELECT 'website_event', count(*) FROM removed;
WITH removed AS (
  DELETE FROM session_data WHERE website_id = '7d8fb646-d5ab-403b-b2a0-96f68c8d8a4d' AND created_at < NOW() - INTERVAL '180 days' RETURNING 1
) INSERT INTO retention_counts SELECT 'session_data', count(*) FROM removed;
WITH removed AS (
  DELETE FROM session_link WHERE website_id = '7d8fb646-d5ab-403b-b2a0-96f68c8d8a4d' AND created_at < NOW() - INTERVAL '180 days' RETURNING 1
) INSERT INTO retention_counts SELECT 'session_link', count(*) FROM removed;
WITH removed AS (
  DELETE FROM heatmap_event WHERE website_id = '7d8fb646-d5ab-403b-b2a0-96f68c8d8a4d' AND created_at < NOW() - INTERVAL '180 days' RETURNING 1
) INSERT INTO retention_counts SELECT 'heatmap_event', count(*) FROM removed;
WITH removed AS (
  DELETE FROM revenue WHERE website_id = '7d8fb646-d5ab-403b-b2a0-96f68c8d8a4d' AND created_at < NOW() - INTERVAL '180 days' RETURNING 1
) INSERT INTO retention_counts SELECT 'revenue', count(*) FROM removed;
WITH removed AS (
  DELETE FROM session_replay WHERE website_id = '7d8fb646-d5ab-403b-b2a0-96f68c8d8a4d' AND created_at < NOW() - INTERVAL '180 days' RETURNING 1
) INSERT INTO retention_counts SELECT 'session_replay', count(*) FROM removed;
WITH removed AS (
  DELETE FROM session_replay_saved WHERE website_id = '7d8fb646-d5ab-403b-b2a0-96f68c8d8a4d' AND created_at < NOW() - INTERVAL '180 days' RETURNING 1
) INSERT INTO retention_counts SELECT 'session_replay_saved', count(*) FROM removed;
WITH removed AS (
  DELETE FROM session s
  WHERE s.website_id = '7d8fb646-d5ab-403b-b2a0-96f68c8d8a4d' AND s.created_at < NOW() - INTERVAL '180 days'
    AND NOT EXISTS (SELECT 1 FROM website_event e WHERE e.website_id = s.website_id AND e.session_id = s.session_id)
    AND NOT EXISTS (SELECT 1 FROM session_data d WHERE d.website_id = s.website_id AND d.session_id = s.session_id)
    AND NOT EXISTS (SELECT 1 FROM session_link l WHERE l.website_id = s.website_id AND l.session_id = s.session_id)
    AND NOT EXISTS (SELECT 1 FROM heatmap_event h WHERE h.website_id = s.website_id AND h.session_id = s.session_id)
    AND NOT EXISTS (SELECT 1 FROM revenue r WHERE r.website_id = s.website_id AND r.session_id = s.session_id)
    AND NOT EXISTS (SELECT 1 FROM session_replay r WHERE r.website_id = s.website_id AND r.session_id = s.session_id)
  RETURNING 1
) INSERT INTO retention_counts SELECT 'session', count(*) FROM removed;
SELECT json_build_object('website', '7d8fb646-d5ab-403b-b2a0-96f68c8d8a4d', 'retentionDays', 180,
  'removed', json_object_agg(table_name, removed)) AS retention_result FROM retention_counts;
COMMIT;
