"""Forced SSH command. No free-form shell or file access through the CI key."""
import json
import os
from pathlib import Path
import re
import subprocess
import sys


def parse(command):
    match = re.fullmatch(r'(release|status) ([0-9]{1,20})', command)
    if not match:
        raise ValueError('Rejected command')
    return match.groups()


def execute(project, command, runner=subprocess.run):
    if project not in ['easycode', 'barrierescouts']:
        raise ValueError('Unknown fixed project')
    action, run_id = parse(command)
    unit = f'{project}-release@{run_id}.service'
    if action == 'release':
        result = runner(['systemctl', 'start', '--no-block', unit], capture_output=True)
        if result.returncode:
            raise ValueError('Job request failed')
        return {'accepted': True, 'run_id': run_id}
    result = runner(['systemctl', 'show', unit, '--property=ActiveState,SubState,Result'], capture_output=True, text=True)
    props = dict(line.split('=', 1) for line in result.stdout.splitlines() if '=' in line)
    if props.get('ActiveState') in ['activating', 'active', 'deactivating']:
        return {'status': 'running'}
    receipt_path = Path('/var/lib') / (project + '-release') / 'runs' / (run_id + '.json')
    receipt = json.loads(receipt_path.read_text()) if receipt_path.exists() else {}
    success = props.get('Result') == 'success' and receipt.get('success') is True
    return {'status': 'success' if success else 'failed',
            **{k: receipt.get(k) for k in ['sha', 'build_id', 'digest', 'id']}}


if __name__ == '__main__':
    try:
        print(json.dumps(execute(sys.argv[1], os.environ.get('SSH_ORIGINAL_COMMAND', ''))))
    except Exception:
        print('{"error":"Rejected release command"}')
        raise SystemExit(1)
