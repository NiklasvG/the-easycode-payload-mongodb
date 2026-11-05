"""CI client: private temporary SSH identity and exact pinned host key."""
import json
import os
from pathlib import Path
import subprocess
import tempfile
import time


def main():
    run_id = os.environ['GITHUB_RUN_ID']
    if not run_id.isdigit():
        raise RuntimeError('Invalid run ID')
    host = os.environ['RELEASE_SSH_HOST']
    if not host or any(x in host for x in [' ', '\n', '\r', '@']):
        raise RuntimeError('Invalid release host')
    with tempfile.TemporaryDirectory() as directory:
        key = Path(directory) / 'identity'
        known = Path(directory) / 'known_hosts'
        key.write_text(os.environ['RELEASE_SSH_KEY'].rstrip() + '\n')
        key.chmod(0o600)
        known.write_text(os.environ['RELEASE_SSH_KNOWN_HOSTS'].rstrip() + '\n')
        command = ['ssh', '-i', str(key), '-o', 'IdentitiesOnly=yes', '-o', 'BatchMode=yes',
                   '-o', 'StrictHostKeyChecking=yes', '-o', 'UserKnownHostsFile=' + str(known),
                   '-o', 'ConnectTimeout=15', 'root@' + host]

        def call(action):
            result = subprocess.run(command + [action + ' ' + run_id], capture_output=True, text=True, timeout=30)
            if result.returncode:
                raise RuntimeError('Restricted release connection failed')
            return json.loads(result.stdout)

        if call('release').get('accepted') is not True:
            raise RuntimeError('Release request rejected')
        deadline = time.monotonic() + 2400
        while time.monotonic() < deadline:
            time.sleep(10)
            result = call('status')
            if result.get('status') == 'success':
                print(json.dumps(result))
                return
            if result.get('status') == 'failed':
                raise RuntimeError('Server release failed; reconcile stored state before retry')
        raise RuntimeError('CI wait ended; server job remains independent. Inspect its stored state.')


if __name__ == '__main__':
    main()
