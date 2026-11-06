#!/usr/bin/python3
"""Fixed-host Mailcow retention. Never prints message, address or credential data."""
import argparse
import base64
import ctypes
import datetime as dt
try:
    import fcntl
except ImportError:
    fcntl = None  # Pure policy tests also run on the Windows workstation.
import gzip
import hashlib
import json
import os
from pathlib import Path
import re
import struct
import subprocess
import time

HERE = Path(__file__).resolve().parent
STATE = Path('/var/lib/mailcow-retention')
LOGS = Path('/var/log/mailcow-security-retained')
PHP = 'mailcowdockerized-php-fpm-mailcow-1'
DAY = 86400
KEYS = ('ACME_LOG', 'POSTFIX_MAILLOG', 'DOVECOT_MAILLOG', 'SOGO_LOG',
        'NETFILTER_LOG', 'AUTODISCOVER_LOG', 'API_LOG', 'RL_LOG', 'WATCHDOG_LOG', 'CRON_LOG')
SECURITY_KEYS = {'NETFILTER_LOG', 'AUTODISCOVER_LOG', 'API_LOG'}
SECURITY = re.compile(r'auth|login|log[ -]?out|sasl|password|invalid user|permission denied|'
                      r'access denied|csrf|fail2ban|netfilter|\[ufw |\bban(?:ned)?\b|'
                      r'/sogo/connect|/sogo/log(?:in|out)|\bsudo\b|polkit', re.I)


def security(source, message, facility=None):
    return (str(facility) in {'4', '10'} or source in SECURITY_KEYS or
            bool(SECURITY.search(source + ' ' + message)))


def timestamp(value):
    try:
        if isinstance(value, (int, float)) or re.fullmatch(r'\d+(?:\.\d+)?', str(value)):
            result = float(value)
        else:
            iso = str(value).replace('Z', '+00:00').replace(',', '.')
            iso = re.sub(r'\.(\d+)', lambda m: '.' + m[1][:6].ljust(6, '0'), iso)
            result = dt.datetime.fromisoformat(iso).timestamp()
        if not 946684800 <= result <= time.time() + DAY:
            raise ValueError('Invalid log timestamp')
        return result
    except (TypeError, ValueError, OverflowError):
        raise ValueError('Unsupported log timestamp') from None


def history_json(raw):
    if raw.startswith(b'\x28\xb5\x2f\xfd'):
        library = ctypes.CDLL('libzstd.so.1')
        library.ZSTD_decompress.argtypes = [ctypes.c_void_p, ctypes.c_size_t,
                                           ctypes.c_void_p, ctypes.c_size_t]
        library.ZSTD_decompress.restype = ctypes.c_size_t
        library.ZSTD_isError.argtypes = [ctypes.c_size_t]
        destination = ctypes.create_string_buffer(8 * 1024 * 1024)
        length = library.ZSTD_decompress(destination, len(destination), raw, len(raw))
        if library.ZSTD_isError(length):
            raise ValueError('History decompression failed')
        raw = destination.raw[:length]
    return json.loads(raw)


def record_age(raw, source, now):
    value = history_json(raw)
    created = timestamp(value.get('unix_time', value.get('time', value.get('timestamp'))))
    category = 'security' if security(source + ' ' + str(value.get('program', '')),
                                      str(value.get('message', ''))) else 'delivery'
    if source in SECURITY_KEYS:
        category = 'security'
    limit = 30 if category == 'security' else 7
    return created < now - limit * DAY


def archive(created, source, message, category='security'):
    limit = 30 if category == 'security' else 7
    if created < time.time() - limit * DAY:
        return
    day = dt.datetime.fromtimestamp(created, dt.timezone.utc).strftime('%Y-%m-%d')
    directory = LOGS / category
    directory.mkdir(parents=True, exist_ok=True, mode=0o700)
    file = directory / (day + '.jsonl')
    entry = json.dumps({'time': created, 'source': source, 'message': message}, ensure_ascii=True)
    with file.open('a', encoding='utf8') as handle:
        os.chmod(file, 0o600)
        handle.write(entry + '\n')


def journal():
    cursor_file = STATE / 'journal-cursor'
    command = ['journalctl', '--no-pager', '--output=json']
    if cursor_file.exists():
        command += ['--after-cursor=' + cursor_file.read_text().strip()]
    else:
        command += ['--since=30 days ago']
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
                               text=True)
    count = 0
    cursor = None
    for line in process.stdout:
        value = json.loads(line)
        cursor = value.get('__CURSOR', cursor)
        source = str(value.get('CONTAINER_TAG', value.get('SYSLOG_IDENTIFIER', 'host')))
        message = value.get('MESSAGE', '')
        if not isinstance(message, str):
            continue
        if security(source, message, value.get('SYSLOG_FACILITY')):
            archive(int(value['__REALTIME_TIMESTAMP']) / 1000000, source, message)
            count += 1
    if process.wait() != 0:
        raise RuntimeError('Journal export failed; retained cursor unchanged')
    if cursor:
        for folder in LOGS.glob('*'):
            for file in folder.glob('*.jsonl'):
                with file.open('rb') as handle:
                    os.fsync(handle.fileno())
        temporary = cursor_file.with_suffix('.next')
        temporary.write_text(cursor)
        os.replace(temporary, cursor_file)
    return count


def prune_archives(now):
    removed = 0
    for category, days in [('delivery', 7), ('security', 30)]:
        directory = LOGS / category
        if not directory.exists():
            continue
        for file in directory.glob('*.jsonl'):
            if file.is_symlink() or not re.fullmatch(r'\d{4}-\d{2}-\d{2}\.jsonl', file.name):
                raise RuntimeError('Unexpected archive path')
            cutoff = now - days * DAY
            end = dt.datetime.fromisoformat(file.stem).replace(tzinfo=dt.timezone.utc).timestamp() + DAY
            if end <= cutoff:
                file.unlink()
                continue
            if end - DAY >= cutoff:
                continue
            temporary = file.with_suffix('.next')
            with file.open() as source, temporary.open('w') as target:
                os.chmod(temporary, 0o600)
                for line in source:
                    if json.loads(line)['time'] >= cutoff:
                        target.write(line)
                    else:
                        removed += 1
                target.flush()
                os.fsync(target.fileno())
            os.replace(temporary, file)
    return removed


def prune_host_archives(now, directory=Path('/var/log')):
    days_by_name = {name: 7 for name in ('syslog', 'mail.info', 'mail.warn', 'mail.err',
                    'mail.log', 'daemon.log', 'kern.log', 'user.log', 'lpr.log',
                    'cron.log', 'debug', 'messages')}
    days_by_name.update({'auth.log': 30, 'ufw.log': 30})
    removed = 0
    for base, days in days_by_name.items():
        for file in directory.glob(base + '.*'):
            if not re.fullmatch(re.escape(base) + r'\.\d+(?:\.gz)?', file.name):
                continue
            if file.is_symlink():
                raise RuntimeError('Unexpected rotated log symlink')
            if file.is_file() and file.stat().st_mtime < now-days*DAY:
                file.unlink()
                removed += 1
    return removed


def bridge(request):
    source = (HERE / 'redis.php').read_text()
    result = subprocess.run(['docker', 'exec', '-i', PHP, 'php', '-r', source],
                            input=json.dumps(request), capture_output=True, text=True, timeout=90)
    if result.returncode:
        raise RuntimeError('Scoped Redis operation failed; details suppressed')
    return json.loads(result.stdout)


def redis_retention(now, dry_run=False):
    history_keys = bridge({'operation': 'history_keys'})
    total, expired = 0, 0
    for key in list(KEYS) + history_keys:
        rows = bridge({'operation': 'read', 'key': key})
        hashes = []
        for encoded in rows:
            raw = base64.b64decode(encoded, validate=True)
            total += 1
            if record_age(raw, key, now):
                hashes.append(hashlib.sha1(raw).hexdigest())
        if hashes:
            expired += len(hashes) if dry_run else bridge(
                {'operation': 'remove', 'key': key, 'hashes': hashes})
    return {'checked': total, 'expired': expired, 'dryRun': dry_run}


def prune_binary_bytes(data, cutoff):
    if len(data) % 384:
        raise RuntimeError('Unexpected utmp record layout')
    return b''.join(data[i:i+384] for i in range(0, len(data), 384)
                    if struct.unpack_from('<i', data, i + 340)[0] >= cutoff)


def prune_binary_stream(handle, cutoff):
    """Compact locked utmp records in place using bounded memory."""
    read_offset, write_offset, removed = 0, 0, 0
    while True:
        handle.seek(read_offset)
        chunk = handle.read(384 * 1024)
        if not chunk:
            break
        retained = prune_binary_bytes(chunk, cutoff)
        read_offset += len(chunk)
        removed += (len(chunk)-len(retained)) // 384
        handle.seek(write_offset)
        handle.write(retained)
        write_offset += len(retained)
    if removed:
        handle.truncate(write_offset)
        handle.flush()
        os.fsync(handle.fileno())
    return removed


def login_history(now):
    if os.uname().machine != 'x86_64':
        raise RuntimeError('Unverified native login-history layout')
    removed = 0
    cutoff = now - 30 * DAY
    for basename in ('wtmp', 'btmp'):
        for path in Path('/var/log').glob(basename + '*'):
            if not re.fullmatch(basename + r'(?:\.\d+)?', path.name) or path.is_symlink():
                continue
            with path.open('r+b') as handle:
                fcntl.lockf(handle, fcntl.LOCK_EX)
                removed += prune_binary_stream(handle, cutoff)
    path = Path('/var/log/lastlog')
    if path.exists() and path.stat().st_size <= 16 * 1024 * 1024:
        with path.open('r+b') as handle:
            fcntl.lockf(handle, fcntl.LOCK_EX)
            offset = 0
            while record := handle.read(292):
                if len(record) != 292:
                    raise RuntimeError('Unexpected lastlog record layout')
                created = struct.unpack_from('<i', record)[0]
                if 0 < created < cutoff:
                    handle.seek(offset)
                    handle.write(bytes(292))
                    handle.flush()
                    removed += 1
                offset += 292
    return removed


def migrate_docker(handle, source):
    count = 0
    for line in handle:
        record = json.loads(line)
        created = timestamp(record['time'])
        message = record.get('log', '').rstrip('\n')
        category = 'security' if security(source, message) else 'delivery'
        archive(created, source, message, category)
        count += 1
    return count


def migrate_text(handle, source, now):
    """Convert a closed legacy syslog stream; never expose its payload."""
    count = 0
    for line in handle:
        match = re.match(r'^([A-Z][a-z]{2}\s+\d{1,2}\s+\d\d:\d\d:\d\d)\s', line)
        if not match:
            continue
        current = dt.datetime.fromtimestamp(now, dt.timezone.utc)
        try:
            value = dt.datetime.strptime(str(current.year)+' '+match[1],
                                         '%Y %b %d %H:%M:%S').replace(tzinfo=dt.timezone.utc)
        except ValueError:
            value = dt.datetime.strptime(str(current.year-1)+' '+match[1],
                                         '%Y %b %d %H:%M:%S').replace(tzinfo=dt.timezone.utc)
        if value.timestamp() > now + DAY:
            value = value.replace(year=current.year-1)
        category = 'security' if security(source, line) else 'delivery'
        archive(value.timestamp(), source, line.rstrip('\n'), category)
        count += 1
    return count


def folder_targets(config, listing):
    aliases = {}
    for value in config:
        name, days = value['name'], value['days']
        if (days not in (14, 30) or not isinstance(name, str) or
                any(c in name for c in '\n\r\0*?') or name.upper() == 'INBOX'):
            raise RuntimeError('Invalid fixed mailbox policy')
        aliases[name] = days
    targets = set()
    for row in listing:
        username, mailbox = row['username'], row['mailbox']
        if not isinstance(username, str) or not isinstance(mailbox, str):
            raise RuntimeError('Unexpected mailbox metadata format')
        for name, days in aliases.items():
            if mailbox == name or mailbox.startswith(name + '/'):
                targets.add((username, mailbox, days))
    return sorted(targets)


def folders():
    config = json.loads((HERE / 'folders.json').read_text())
    prefix = ['docker', 'exec', 'mailcowdockerized-dovecot-mailcow-1', 'doveadm']
    listing = subprocess.run(prefix + ['-f', 'json', 'mailbox', 'list', '-A'],
                             capture_output=True, text=True, timeout=180)
    if listing.returncode:
        raise RuntimeError('Cannot list existing special-folder metadata')
    targets = folder_targets(config, json.loads(listing.stdout))
    for username, name, days in targets:
        result = subprocess.run(prefix + ['expunge', '-u', username, 'mailbox', name,
                                          'savedbefore', str(days) + 'd'],
                                capture_output=True, timeout=300)
        if result.returncode:
            raise RuntimeError('Special-folder expunge failed; details suppressed')
    return {'folderAliases': len(config), 'existingSpecialFolders': len(targets),
            'completed': True}


def main():
    if fcntl is None:
        raise RuntimeError('The operational helper requires Linux')
    parser = argparse.ArgumentParser()
    parser.add_argument('action', choices=['run', 'dry-run', 'folders', 'journal'])
    action = parser.parse_args().action
    STATE.mkdir(parents=True, exist_ok=True, mode=0o700)
    LOGS.mkdir(parents=True, exist_ok=True, mode=0o700)
    with (STATE / 'lock').open('w') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        if action == 'folders':
            result = folders()
        elif action == 'journal':
            result = {'securityEventsArchived': journal()}
        elif action == 'dry-run':
            result = redis_retention(time.time(), True)
        else:
            result = {'securityEventsArchived': journal(),
                      'redis': redis_retention(time.time()),
                      'archiveBoundaryEntriesRemoved': prune_archives(time.time()),
                      'closedHostLogFilesRemoved': prune_host_archives(time.time()),
                      'loginHistoryEntriesRemoved': login_history(time.time())}
            marker = STATE / 'journal-rotation'
            command = ['journalctl', '--vacuum-time=7d']
            if not marker.exists() or time.time()-marker.stat().st_mtime >= 3600:
                command.insert(1, '--rotate')
            completed = subprocess.run(command,
                                       capture_output=True, timeout=120)
            if completed.returncode:
                raise RuntimeError('Journal age cleanup failed')
            if '--rotate' in command:
                marker.touch()
        print(json.dumps(result))


if __name__ == '__main__':
    main()
