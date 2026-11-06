#!/usr/bin/python3
"""Fixed-host archive validation and configuration backup helpers."""
import datetime as dt
import fcntl
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import subprocess
import tarfile
import time

ROOT = Path('/mnt/HC_Volume_102089935')
UUID = 'c5c96171-ec71-4608-a981-9e913f47d8e2'
MAILCOW = Path('/opt/mailcow-dockerized')
WORK = Path('/var/lib/mailcow-nightly-backup')
STATE = WORK/'state.json'
LOG = WORK/'native-run.log'
COMPONENTS = {'vmail': 'vmail', 'crypt': 'crypt', 'redis': 'redis',
              'rspamd': 'rspamd', 'postfix': 'postfix', 'mariadb': 'backup_mariadb'}


def utc():
    return dt.datetime.now(dt.timezone.utc).isoformat()


def save(state):
    temporary = STATE.with_suffix('.next')
    with temporary.open('w') as file:
        os.chmod(temporary, 0o600)
        json.dump(state, file)
        file.flush()
        os.fsync(file.fileno())
    os.replace(temporary, STATE)


def mount_check():
    result = subprocess.run(['findmnt', '--json', '--mountpoint', str(ROOT),
                             '--output', 'TARGET,UUID'], capture_output=True, text=True,
                            check=True)
    value = json.loads(result.stdout)['filesystems']
    if len(value) != 1 or value[0]['uuid'] != UUID or not ROOT.is_mount():
        raise RuntimeError('Fixed backup mount mismatch')


def metadata(directory):
    if not directory.is_dir() or directory.is_symlink() or directory.resolve().parent != ROOT:
        raise RuntimeError('Unexpected backup directory')
    result = {}
    for file in directory.iterdir():
        if not file.is_file() or file.is_symlink():
            raise RuntimeError('Unexpected nested or linked backup entry')
        stat = file.stat()
        result[file.name] = [stat.st_size, stat.st_mtime_ns, stat.st_ino]
    return result


def assert_no_existing_backup():
    if subprocess.run(['docker', 'container', 'inspect', 'mailcow-backup'],
                      capture_output=True).returncode == 0:
        raise RuntimeError('Existing native helper requires reconciliation')
    for proc in Path('/proc').iterdir():
        if not proc.name.isdigit():
            continue
        try:
            if b'backup_and_restore.sh' in (proc/'cmdline').read_bytes():
                raise RuntimeError('Another native backup/restore process exists')
        except (OSError, PermissionError):
            pass


def directory_set():
    return {p.name for p in ROOT.glob('mailcow-*') if p.is_dir() and not p.is_symlink()}


def digest(file):
    value = hashlib.sha256()
    with file.open('rb') as handle:
        for chunk in iter(lambda: handle.read(4*1024*1024), b''):
            value.update(chunk)
    return value.hexdigest()


def verify_archive(file, prefix):
    decompressor = subprocess.Popen(['zstd', '-q', '-d', '-c', str(file)],
                                    stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    count, regular, total, checkpoint, prepared = 0, 0, 0, None, False
    try:
        with tarfile.open(fileobj=decompressor.stdout, mode='r|') as archive:
            for member in archive:
                name = PurePosixPath(member.name)
                normalized = str(name).lstrip('/')
                if '..' in name.parts or (prefix and normalized.split('/')[0] != prefix):
                    raise RuntimeError('Unexpected archive member path')
                count += 1
                if member.isfile():
                    regular += 1
                    total += member.size
                if prefix == 'backup_mariadb' and name.name == 'xtrabackup_checkpoints':
                    if member.size > 16384:
                        raise RuntimeError('Unexpected database checkpoint size')
                    checkpoint = archive.extractfile(member).read().decode('ascii')
                    prepared = bool(re.search(r'^backup_type\s*=\s*log-applied\s*$',
                                              checkpoint, re.M))
                # Validation does not need tarfile's archive-wide metadata cache.
                archive.members.clear()
        # Consume the rest of the compressed frame to verify the Zstandard checksum,
        # including padding after the tar end marker. Nothing is extracted to disk.
        while decompressor.stdout.read(4*1024*1024):
            pass
        if decompressor.wait() != 0 or count == 0:
            raise RuntimeError('Archive stream/checksum verification failed')
        if prefix in ('vmail', 'crypt', 'redis', 'backup_mariadb') and regular == 0:
            raise RuntimeError('Required backup component has no files')
        if prefix == 'backup_mariadb' and not prepared:
            raise RuntimeError('Database backup is not fully prepared')
    finally:
        if decompressor.poll() is None:
            decompressor.terminate()
        decompressor.stdout.close()
        decompressor.wait()
    return {'entries': count, 'regularFiles': regular, 'uncompressedFileBytes': total,
            'tarReadable': True, 'zstdStreamValid': True,
            **({'databasePrepared': True, 'databaseBackupType': 'log-applied'}
               if prefix == 'backup_mariadb' else {})}


def create_configuration_archive(target, log):
    candidates = [MAILCOW/'mailcow.conf', MAILCOW/'.env', MAILCOW/'docker-compose.yml',
                  MAILCOW/'docker-compose.override.yml', MAILCOW/'data/conf',
                  MAILCOW/'data/assets/ssl', MAILCOW/'data/assets/templates',
                  MAILCOW/'data/hooks', Path('/srv/mailcow-retention'), Path('/srv/mailcow-nightly-backup'),
                  Path('/etc/systemd/journald.conf.d/60-mailcow-retention.conf')]
    candidates += [Path('/etc/systemd/system')/name for name in
                   ('mailcow-retention.service', 'mailcow-retention.timer',
                    'mailcow-folder-retention.service', 'mailcow-folder-retention.timer',
                    'mailcow-nightly-backup.service', 'mailcow-nightly-backup.timer')]
    candidates += [Path('/etc/logrotate.d')/name for name in ('rsyslog', 'ufw', 'wtmp', 'btmp')]
    members = [str(p).lstrip('/') for p in candidates if p.exists() or p.is_symlink()]
    result = subprocess.run(['tar', '--exclude=__pycache__', '--use-compress-program=zstd -T2',
                             '-C', '/', '-cpf', str(target/'backup_configuration.tar.zst'),
                             *members], stdout=log, stderr=log)
    if result.returncode:
        raise RuntimeError('Configuration backup did not complete cleanly')
    (target/'backup_configuration.tar.zst').chmod(0o600)
    return members

