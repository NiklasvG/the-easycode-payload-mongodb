#!/usr/bin/python3
"""One verified Mailcow generation; never remove the predecessor on backup failure."""
import datetime as dt
import fcntl
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys

import backup_tools as tools

ROOT = tools.ROOT
STATE = Path('/var/lib/mailcow-nightly-backup')
CURRENT = STATE/'current.json'
LAST_RUN = STATE/'last-run.json'
EXPECTED = {'backup_'+name+'.tar.zst' for name in tools.COMPONENTS} | {
    'backup_configuration.tar.zst', 'mailcow.conf', '.x86_64', 'verification.json'}
ERROR_MARKERS = ('file changed as we read it', 'Cannot stat', 'No space left',
                 'Permission denied', 'Error response from daemon', 'Cannot open')


def write_json(path, value):
    temporary = path.with_suffix('.next')
    with temporary.open('w') as handle:
        os.chmod(temporary, 0o600)
        json.dump(value, handle, indent=2)
        handle.flush()
        os.fsync(handle.fileno())
    os.replace(temporary, path)
    fd = os.open(path.parent, os.O_RDONLY | os.O_DIRECTORY)
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def checked_path(name):
    path = Path(name)
    if (not re.fullmatch(r'mailcow-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}', path.name)
            or path.parent != ROOT or path.resolve().parent != ROOT.resolve()
            or path.is_symlink()):
        raise RuntimeError('Backup path is not an allowed direct child of the fixed volume')
    return path


def verified_current(ledger):
    path = checked_path(ledger['directory'])
    if tools.metadata(path) != ledger['metadata'] or set(ledger['metadata']) != EXPECTED:
        raise RuntimeError('Current verified backup changed or has unexpected files')
    manifest = json.loads((path/'verification.json').read_text())
    if manifest.get('phase') != 'verified' or manifest.get('archiveCount') != 7:
        raise RuntimeError('Current backup has no successful verification manifest')
    if not manifest['archives']['mariadb'].get('databasePrepared'):
        raise RuntimeError('Current database backup has not been prepared')
    if set(manifest['archives']) != set(tools.COMPONENTS) | {'configuration'}:
        raise RuntimeError('Current backup is missing a verified component')
    for evidence in manifest['archives'].values():
        archive = path/evidence['file']
        if (not evidence.get('tarReadable') or not evidence.get('zstdStreamValid')
                or archive.stat().st_size != evidence['bytes']):
            raise RuntimeError('Current backup evidence is incomplete')
    return path


def finish_cleanup(ledger):
    """A saved, verified successor must exist before each predecessor unlink."""
    tools.mount_check()
    current = verified_current(ledger)
    previous = ledger.get('previous')
    if previous:
        old = checked_path(previous['directory'])
        if old == current or set(previous['metadata']) != EXPECTED:
            raise RuntimeError('Invalid predecessor deletion plan')
        if old.exists():
            remaining = tools.metadata(old)
            # Subsets allow recovery after a crash between individual file deletions.
            if any(name not in previous['metadata'] or value != previous['metadata'][name]
                   for name, value in remaining.items()):
                raise RuntimeError('Predecessor changed after verification')
            for name in sorted(remaining):
                tools.mount_check()
                verified_current(ledger)
                if tools.metadata(old).get(name) != remaining[name]:
                    raise RuntimeError('Predecessor file changed before deletion')
                (old/name).unlink()
            old.rmdir()
    ledger['previous'] = None
    ledger['phase'] = 'ready'
    ledger['rotationFinished'] = tools.utc()
    write_json(CURRENT, ledger)
    return ledger


def preflight():
    tools.mount_check()
    tools.assert_no_existing_backup()
    ledger = json.loads(CURRENT.read_text())
    current = verified_current(ledger)
    allowed = {current.name}
    if ledger.get('previous'):
        allowed.add(checked_path(ledger['previous']['directory']).name)
    if tools.directory_set() - allowed:
        raise RuntimeError('Unmanaged or partial backup requires operator review; nothing deleted')
    if ledger.get('phase') != 'cleanup-pending':
        size = sum(v[0] for v in ledger['metadata'].values())
        if shutil.disk_usage(ROOT).free < size*1.25 + 1024**3:
            raise RuntimeError('Insufficient reserve for old and new backup; current retained')
    return ledger


def native_backup(before, state):
    environment = os.environ.copy()
    environment.update({'MAILCOW_BACKUP_LOCATION': str(ROOT), 'THREADS': '2'})
    markers = {key: 0 for key in (*ERROR_MARKERS, 'completed OK!')}
    process = subprocess.Popen(
        ['bash', '-e', str(tools.MAILCOW/'helper-scripts/backup_and_restore.sh'), 'backup', 'all'],
        cwd=tools.MAILCOW, env=environment, stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    try:
        for raw in process.stdout:
            line = raw.decode('utf8', errors='replace')
            for key in markers:
                markers[key] += key in line
            new = tools.directory_set()-before
            if len(new) == 1:
                destination = checked_path(ROOT/next(iter(new)))
                destination.chmod(0o700)
        code = process.wait()
    finally:
        process.stdout.close()
    state['nativeExitCode'] = code
    state['nativeSummary'] = markers
    write_json(LAST_RUN, state)
    if code or any(markers[key] for key in ERROR_MARKERS) or markers['completed OK!'] < 2:
        raise RuntimeError('Native backup did not complete cleanly; current retained')
    new = tools.directory_set()-before
    if len(new) != 1:
        raise RuntimeError('Expected exactly one new native backup')
    return checked_path(ROOT/next(iter(new)))


def run():
    state = {'started': tools.utc(), 'phase': 'preflight', 'archives': {},
             'restoreTestPerformed': False, 'retainedSuccessfulGenerations': 1}
    try:
        ledger = preflight()
        if ledger['phase'] == 'cleanup-pending':
            finish_cleanup(ledger)
            state.update({'phase': 'completed-recovered-cleanup', 'finished': tools.utc()})
            write_json(LAST_RUN, state)
            return
        old = verified_current(ledger)
        old_metadata = tools.metadata(old)
        state['phase'] = 'native-backup'
        write_json(LAST_RUN, state)
        destination = native_backup(tools.directory_set(), state)
        state.update({'phase': 'configuration-backup', 'directory': str(destination)})
        write_json(LAST_RUN, state)
        with open(os.devnull, 'wb') as quiet:
            tools.create_configuration_archive(destination, quiet)
        for file in destination.iterdir():
            if file.is_file():
                file.chmod(0o600)
        state['phase'] = 'verifying'
        for name, prefix in [*tools.COMPONENTS.items(), ('configuration', None)]:
            state['currentVerification'] = name
            write_json(LAST_RUN, state)
            file = destination/('backup_'+name+'.tar.zst')
            if not file.is_file() or file.is_symlink() or file.stat().st_size == 0:
                raise RuntimeError('Missing native component; current retained')
            evidence = tools.verify_archive(file, prefix)
            evidence.update({'file': file.name, 'bytes': file.stat().st_size,
                             'sha256': tools.digest(file)})
            state['archives'][name] = evidence
        if tools.digest(destination/'mailcow.conf') != tools.digest(tools.MAILCOW/'mailcow.conf'):
            raise RuntimeError('Configuration changed during backup; current retained')
        if tools.metadata(old) != old_metadata:
            raise RuntimeError('Previous backup changed during new backup')
        tools.mount_check()
        state.update({'phase': 'verified', 'archiveCount': 7, 'currentVerification': None,
                      'finished': tools.utc(), 'configurationFileMatchesLiveSource': True})
        write_json(destination/'verification.json', state)
        new_ledger = {'phase': 'cleanup-pending', 'directory': str(destination),
                      'metadata': tools.metadata(destination),
                      'previous': {'directory': str(old), 'metadata': old_metadata}}
        verified_current(new_ledger)
        # Durable new-success pointer before any old-backup deletion.
        write_json(CURRENT, new_ledger)
        finish_cleanup(new_ledger)
        state.update({'phase': 'completed', 'rotationFinished': tools.utc(),
                      'freeBytes': shutil.disk_usage(ROOT).free,
                      'deletedPrevious': str(old)})
        write_json(LAST_RUN, state)
    except Exception as error:
        state.update({'phase': 'attention', 'errorClass': type(error).__name__,
                      'failed': tools.utc()})
        write_json(LAST_RUN, state)
        raise RuntimeError('Nightly backup incomplete; inspect private state; no blind retry') from None


if __name__ == '__main__':
    os.umask(0o077)
    if len(sys.argv) != 2 or sys.argv[1] not in ('preflight', 'run'):
        raise SystemExit('Use preflight or run')
    with (STATE/'lock').open('w') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        with (Path('/srv/mailcow-backup-once-20261106')/'lock').open('w') as initial_lock:
            fcntl.flock(initial_lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
            if sys.argv[1] == 'preflight':
                value = preflight()
                print(json.dumps({'preflightPassed': True, 'current': value['directory'],
                                  'freeBytes': shutil.disk_usage(ROOT).free}))
            else:
                run()
                print(json.dumps({'phase': 'completed', 'retainedSuccessfulGenerations': 1}))
