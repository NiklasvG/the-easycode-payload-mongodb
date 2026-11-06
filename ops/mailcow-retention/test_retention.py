import importlib.util
from pathlib import Path
import json
import struct
import tempfile
import time
import unittest
from unittest.mock import patch
import io
import datetime as dt
import os

spec = importlib.util.spec_from_file_location('retention', Path(__file__).with_name('retention.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class RetentionTests(unittest.TestCase):
    def test_old_closed_host_logs_are_removed_even_without_new_log_activity(self):
        now = time.time()
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder)
            for name, age in [('mail.log.1', 8), ('auth.log.1', 8),
                              ('auth.log.2.gz', 31), ('syslog', 20),
                              ('unrelated.log.1', 100), ('mail.log.backup', 100)]:
                file = path/name
                file.write_text('synthetic')
                os.utime(file, (now-age*86400, now-age*86400))
            self.assertEqual(module.prune_host_archives(now, path), 2)
            self.assertEqual(sorted(p.name for p in path.iterdir()),
                             ['auth.log.1', 'mail.log.backup', 'syslog', 'unrelated.log.1'])

    def test_only_existing_special_folders_and_their_children_are_targeted(self):
        config = [{'name': 'Junk', 'days': 14}, {'name': 'Trash', 'days': 30}]
        listing = [{'username': 'synthetic@example.test', 'mailbox': name}
                   for name in ['INBOX', 'Sent', 'Archive', 'Junk', 'Trash',
                                'Trash/old', 'Trashcan', 'Archive/Trash']]
        targets = module.folder_targets(config, listing)
        self.assertEqual([(name, days) for _, name, days in targets],
                         [('Junk', 14), ('Trash', 30), ('Trash/old', 30)])
        self.assertEqual(module.folder_targets(config, listing[:1]), [])
        with self.assertRaises(RuntimeError):
            module.folder_targets([{'name': '*', 'days': 30}], listing)

    def test_streamed_login_history_keeps_recent_records_across_chunk_boundaries(self):
        cutoff = int(time.time())-30*86400
        old, recent = bytearray(384), bytearray(384)
        struct.pack_into('<i', old, 340, cutoff-1)
        struct.pack_into('<i', recent, 340, cutoff+1)
        with tempfile.TemporaryFile() as handle:
            handle.write(bytes(old)*1100+bytes(recent)*1100+bytes(old)*1100)
            self.assertEqual(module.prune_binary_stream(handle, cutoff), 2200)
            handle.seek(0)
            self.assertEqual(handle.read(), bytes(recent)*1100)
            self.assertEqual(module.prune_binary_stream(handle, cutoff), 0)

    def test_legacy_syslog_year_rollover_does_not_turn_old_entries_into_future_entries(self):
        now = dt.datetime(2026, 1, 1, 12, tzinfo=dt.timezone.utc).timestamp()
        with patch.object(module, 'archive') as write:
            module.migrate_text(io.StringIO('Dec 31 11:00:00 host sshd: synthetic login\n'),
                                'legacy-auth.log', now)
            self.assertEqual(dt.datetime.fromtimestamp(write.call_args.args[0], dt.timezone.utc).year,
                             2025)
            self.assertEqual(write.call_args.args[3], 'security')

    def test_docker_nanoseconds_are_compatible_with_python_310(self):
        self.assertEqual(module.timestamp('2026-10-22T11:21:07.288336795Z'),
                         module.timestamp('2026-10-22T11:21:07.288336Z'))
        self.assertEqual(module.timestamp('2026-10-28T17:05:59.18986Z'),
                         module.timestamp('2026-10-28T17:05:59.189860Z'))
        self.assertEqual(module.timestamp('2026-10-28T17:05:59.1Z'),
                         module.timestamp('2026-10-28T17:05:59.100000Z'))

    def test_delivery_and_security_have_distinct_age_boundaries(self):
        now = time.time()
        for age, source, message, expected in [
                (8, 'POSTFIX_MAILLOG', 'status=sent', True),
                (6, 'POSTFIX_MAILLOG', 'status=sent', False),
                (8, 'DOVECOT_MAILLOG', 'imap-login: Login', False),
                (31, 'DOVECOT_MAILLOG', 'imap-login: Login', True),
                (8, 'API_LOG', 'request', False),
                (31, 'API_LOG', 'request', True)]:
            raw = json.dumps({'time': str(now-age*86400), 'message': message}).encode()
            self.assertEqual(module.record_age(raw, source, now), expected)

    def test_malformed_or_unknown_timestamps_fail_instead_of_silent_retention(self):
        for value in [b'{}', b'null', b'{"time":"yesterday"}']:
            with self.assertRaises((ValueError, AttributeError)):
                module.record_age(value, 'POSTFIX_MAILLOG', time.time())

    def test_boundary_archive_keeps_new_records_and_removes_expired_records(self):
        now = time.time()
        original = module.LOGS
        try:
            with tempfile.TemporaryDirectory() as directory:
                module.LOGS = Path(directory)
                module.archive(now-30*86400+100, 'sshd', 'synthetic recent login')
                module.archive(now-30*86400-100, 'sshd', 'synthetic expired login')
                # archive() already refuses expired records; insert one to verify cleanup.
                file = next((module.LOGS/'security').glob('*.jsonl'))
                with file.open('a') as handle:
                    handle.write(json.dumps({'time': now-30*86400-100, 'message':'synthetic'})+'\n')
                module.prune_archives(now)
                rows = [json.loads(line) for line in file.read_text().splitlines()]
                self.assertEqual(len(rows), 1)
                self.assertGreaterEqual(rows[0]['time'], now-30*86400)
        finally:
            module.LOGS = original

    def test_utmp_layout_removes_only_expired_records(self):
        cutoff = int(time.time())-30*86400
        old, recent = bytearray(384), bytearray(384)
        struct.pack_into('<i', old, 340, cutoff-1)
        struct.pack_into('<i', recent, 340, cutoff+1)
        self.assertEqual(module.prune_binary_bytes(bytes(old+recent), cutoff), bytes(recent))
        with self.assertRaises(RuntimeError):
            module.prune_binary_bytes(b'invalid-layout', cutoff)


if __name__ == '__main__':
    unittest.main()
