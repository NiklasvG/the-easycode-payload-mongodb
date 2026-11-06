#!/usr/bin/python3
"""Synthetic archives and temporary directories only; never access production data."""
import io
import json
from pathlib import Path
import subprocess
import tarfile
import tempfile
import unittest
from unittest.mock import patch

import backup_tools as tools
import nightly


class RotationTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix='mailcow-nightly-tests-')
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)/'volume'
        self.root.mkdir()
        self.state = Path(self.tmp.name)/'state'
        self.state.mkdir()
        self.source = Path(self.tmp.name)/'mailcow'
        self.source.mkdir()
        (self.source/'mailcow.conf').write_text('SYNTHETIC_CONFIGURATION_ONLY=true\n')
        for obj, name, value in [(tools, 'ROOT', self.root), (tools, 'MAILCOW', self.source),
                                 (nightly, 'ROOT', self.root), (nightly, 'STATE', self.state),
                                 (nightly, 'CURRENT', self.state/'current.json'),
                                 (nightly, 'LAST_RUN', self.state/'last-run.json')]:
            p = patch.object(obj, name, value)
            p.start()
            self.addCleanup(p.stop)
        for name in ['mount_check', 'assert_no_existing_backup']:
            p = patch.object(tools, name)
            p.start()
            self.addCleanup(p.stop)
        self.old = self.make_backup('mailcow-2026-11-06-01-30-00')
        self.ledger = {'phase': 'ready', 'directory': str(self.old),
                       'metadata': tools.metadata(self.old), 'previous': None}
        nightly.write_json(nightly.CURRENT, self.ledger)

    def make_archive(self, file, member, data):
        stream = io.BytesIO()
        with tarfile.open(fileobj=stream, mode='w') as archive:
            info = tarfile.TarInfo(member)
            info.size = len(data)
            archive.addfile(info, io.BytesIO(data))
        result = subprocess.run(['zstd', '-q', '-c'], input=stream.getvalue(),
                                capture_output=True, check=True)
        file.write_bytes(result.stdout)

    def make_backup(self, name, final=True, prepared=True):
        target = self.root/name
        target.mkdir()
        archives = {}
        for component, prefix in [*tools.COMPONENTS.items(), ('configuration', None)]:
            file = target/('backup_'+component+'.tar.zst')
            member, content = ((prefix or 'configuration')+'/sample', b'SYNTHETIC DATA')
            if component == 'mariadb':
                member = prefix+'/xtrabackup_checkpoints'
                content = b'backup_type = log-applied\n' if prepared else b'backup_type = full-backuped\n'
            self.make_archive(file, member, content)
            if final:
                evidence = tools.verify_archive(file, prefix)
                archives[component] = {**evidence, 'file': file.name,
                                       'bytes': file.stat().st_size, 'sha256': tools.digest(file)}
        (target/'mailcow.conf').write_bytes((self.source/'mailcow.conf').read_bytes())
        (target/'.x86_64').touch()
        if final:
            nightly.write_json(target/'verification.json',
                               {'phase': 'verified', 'archiveCount': 7, 'archives': archives})
        return target

    def new_native(self, before, state):
        return self.make_backup('mailcow-2026-11-07-01-30-00', final=False)

    def run_with(self, native):
        with patch.object(nightly, 'native_backup', side_effect=native), \
                patch.object(tools, 'create_configuration_archive'):
            nightly.run()

    def test_verified_success_rotates_only_after_new_manifest(self):
        self.run_with(self.new_native)
        ledger = json.loads(nightly.CURRENT.read_text())
        self.assertFalse(self.old.exists())
        self.assertEqual(ledger['phase'], 'ready')
        self.assertTrue(nightly.verified_current(ledger).exists())
        self.assertEqual(len(list(self.root.iterdir())), 1)

    def test_native_failure_keeps_previous(self):
        with self.assertRaises(RuntimeError):
            self.run_with(lambda *_: (_ for _ in ()).throw(RuntimeError('synthetic failure')))
        self.assertEqual(tools.metadata(self.old), self.ledger['metadata'])
        self.assertEqual(json.loads(nightly.CURRENT.read_text()), self.ledger)

    def test_corrupt_archive_keeps_previous(self):
        def bad(before, state):
            path = self.new_native(before, state)
            (path/'backup_vmail.tar.zst').write_bytes(b'not a compressed archive')
            return path
        with self.assertRaises(Exception):
            self.run_with(bad)
        self.assertEqual(tools.metadata(self.old), self.ledger['metadata'])

    def test_unprepared_mariadb_keeps_previous(self):
        with self.assertRaises(RuntimeError):
            self.run_with(lambda *_: self.make_backup('mailcow-2026-11-07-01-30-00',
                                                      final=False, prepared=False))
        self.assertEqual(tools.metadata(self.old), self.ledger['metadata'])

    def test_missing_mount_keeps_previous(self):
        with patch.object(tools, 'mount_check', side_effect=RuntimeError('synthetic wrong mount')):
            with self.assertRaises(RuntimeError):
                nightly.preflight()
        self.assertEqual(tools.metadata(self.old), self.ledger['metadata'])

    def test_partial_unmanaged_backup_blocks_retry(self):
        (self.root/'mailcow-2026-11-07-01-30-00').mkdir()
        with self.assertRaises(RuntimeError):
            nightly.preflight()
        self.assertTrue(self.old.exists())

    def test_cleanup_resumes_after_partial_unlink(self):
        new = self.make_backup('mailcow-2026-11-07-01-30-00')
        ledger = {'phase': 'cleanup-pending', 'directory': str(new),
                  'metadata': tools.metadata(new), 'previous':
                  {'directory': str(self.old), 'metadata': self.ledger['metadata']}}
        (self.old/'backup_redis.tar.zst').unlink()
        nightly.finish_cleanup(ledger)
        self.assertFalse(self.old.exists())
        self.assertTrue(new.exists())

    def test_unexpected_predecessor_entry_blocks_cleanup(self):
        new = self.make_backup('mailcow-2026-11-07-01-30-00')
        ledger = {'phase': 'cleanup-pending', 'directory': str(new),
                  'metadata': tools.metadata(new), 'previous':
                  {'directory': str(self.old), 'metadata': self.ledger['metadata']}}
        (self.old/'unexpected').write_text('SYNTHETIC')
        with self.assertRaises(RuntimeError):
            nightly.finish_cleanup(ledger)
        self.assertTrue(self.old.exists())
        self.assertTrue(new.exists())

    def test_changed_successor_cannot_authorize_deletion(self):
        ledger = {**self.ledger, 'previous': {'directory': str(self.old),
                                            'metadata': self.ledger['metadata']}}
        (self.old/'backup_redis.tar.zst').write_bytes(b'changed')
        with self.assertRaises(RuntimeError):
            nightly.finish_cleanup(ledger)
        self.assertTrue(self.old.exists())

    def test_current_cannot_be_its_own_predecessor(self):
        ledger = {**self.ledger, 'previous': {'directory': str(self.old),
                                            'metadata': self.ledger['metadata']}}
        with self.assertRaises(RuntimeError):
            nightly.finish_cleanup(ledger)
        self.assertEqual(tools.metadata(self.old), self.ledger['metadata'])

    def test_outside_path_and_symlink_are_rejected(self):
        outside = Path(self.tmp.name)/'mailcow-2026-11-08-01-30-00'
        outside.mkdir()
        with self.assertRaises(RuntimeError):
            nightly.checked_path(outside)
        link = self.root/'mailcow-2026-11-08-01-30-00'
        link.symlink_to(outside, target_is_directory=True)
        with self.assertRaises(RuntimeError):
            nightly.checked_path(link)

    def test_checksum_failure_is_detected(self):
        file = self.old/'backup_vmail.tar.zst'
        data = bytearray(file.read_bytes())
        data[-1] ^= 0xFF
        file.write_bytes(data)
        with self.assertRaises(Exception):
            tools.verify_archive(file, 'vmail')


if __name__ == '__main__':
    unittest.main(verbosity=1)
