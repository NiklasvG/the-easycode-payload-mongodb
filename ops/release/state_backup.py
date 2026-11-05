"""Back up only a project's nonsecret release receipt/state, never its config."""
import base64
import datetime
import fcntl
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
import uuid


def backup(config):
    directory = Path(config['state_directory'])
    state = json.loads((directory / 'state.json').read_text())
    if state.get('active'):
        raise RuntimeError('Unfinished release must be reconciled before state backup')
    envelope = {'format': 1, 'project': config['project'], 'application': config['application'], 'state': state}
    raw = json.dumps(envelope, sort_keys=True).encode()
    digest = hashlib.sha256(raw).hexdigest()
    filename = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S') + '-' + str(uuid.uuid4()) + '.json'
    prefix = 'release-job-state/' + config['project']
    payload = base64.b64encode(json.dumps({'project': config['project'], 'application': config['application'],
        'prefix': prefix, 'filename': filename, 'content': base64.b64encode(raw).decode(), 'digest': digest}).encode()).decode()
    php = r'''<?php
require '/var/www/html/vendor/autoload.php';$app=require '/var/www/html/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$c=json_decode(base64_decode('PAYLOAD'),true,512,JSON_THROW_ON_ERROR);
$a=App\Models\Application::where('uuid',$c['application'])->firstOrFail();
if($a->environment->project->uuid!==$c['project']||$c['prefix']!=='release-job-state/'.$c['project'])throw new Exception('Project mismatch');
if(!preg_match('/^[0-9]{8}T[0-9]{6}-[a-f0-9-]{36}\.json$/',$c['filename']))throw new Exception('Invalid file');
$f=App\Models\S3Storage::findOrFail(1)->filesystem();$key=$c['prefix'].'/'.$c['filename'];$raw=base64_decode($c['content']);
if(!$f->put($key,$raw))throw new Exception('Upload failed');
$stream=$f->readStream($key);$restored=stream_get_contents($stream);fclose($stream);
if(hash('sha256',$restored)!==$c['digest'])throw new Exception('S3 verification failed');
$files=array_values(array_filter($f->files($c['prefix']),fn($p)=>preg_match('#^'.preg_quote($c['prefix'],'#').'/[0-9]{8}T[0-9]{6}-[a-f0-9-]{36}\.json$#',$p)));
rsort($files);foreach(array_slice($files,14) as $old)$f->delete($old);
echo json_encode(['s3Verified'=>true,'sha256'=>$c['digest'],'filename'=>$c['filename']]);
'''.replace('PAYLOAD', payload)
    result = subprocess.run(['docker', 'exec', '-i', 'coolify', 'php'], input=php,
                            capture_output=True, text=True, timeout=90)
    if result.returncode:
        raise RuntimeError('Project release-state S3 backup failed')
    receipt = json.loads(result.stdout)
    local = directory / 'backups'
    local.mkdir(exist_ok=True, mode=0o700)
    path = local / filename
    path.write_bytes(raw)
    path.chmod(0o600)
    files = sorted(p for p in local.iterdir() if re.fullmatch(r'[0-9]{8}T[0-9]{6}-[a-f0-9-]{36}\.json', p.name))
    for old in files[:-2]:
        old.unlink()
    return receipt


if __name__ == '__main__':
    try:
        config = json.loads(Path(sys.argv[1]).read_text())
        with (Path(config['state_directory']) / 'operations.lock').open('a') as lock:
            fcntl.flock(lock, fcntl.LOCK_EX)
            print(json.dumps(backup(config)))
    except Exception:
        print('{"success":false,"error":"Release-state backup failed"}')
        raise SystemExit(1)
