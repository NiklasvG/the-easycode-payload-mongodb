"""Project-scoped, resumable one-shot release. No public listener or dependencies."""
import argparse
try:
    import fcntl
except ImportError:  # Offline unit tests on Windows; server execution is POSIX only.
    fcntl = None
import json
import os
from pathlib import Path
import re
import subprocess
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid


class ReleaseError(Exception):
    pass


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args):
        return None


def atomic(path, data):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix('.next')
    with temp.open('w', encoding='utf-8') as stream:
        os.chmod(temp, 0o600)
        json.dump(data, stream)
        stream.flush()
        os.fsync(stream.fileno())
    os.replace(temp, path)
    if os.name == 'nt':
        return
    descriptor = os.open(path.parent, os.O_RDONLY)
    try:
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def load(path):
    return json.loads(Path(path).read_text()) if Path(path).exists() else {}


class Client:
    def __init__(self, base, token):
        self.base, self.token = base.rstrip('/'), token

    def __call__(self, path, method='GET', body=None):
        request = urllib.request.Request(self.base + path, method=method,
            data=json.dumps(body).encode() if body is not None else None,
            headers={'Authorization': 'Bearer ' + self.token, 'Accept': 'application/json',
                     'Content-Type': 'application/json', 'User-Agent': 'project-release-job'})
        try:
            with urllib.request.build_opener(NoRedirect).open(request, timeout=30) as response:
                return json.load(response)
        except Exception:
            # Provider errors and request objects can contain secrets. Never echo them.
            raise ReleaseError('Remote API request failed') from None


def public(url):
    try:
        request = urllib.request.Request(url, headers={'Cache-Control': 'no-cache',
                                                     'User-Agent': 'project-release-job'})
        with urllib.request.build_opener(NoRedirect).open(request, timeout=15) as response:
            return response.status, dict(response.headers), response.read(4 * 1024 * 1024).decode()
    except Exception:
        raise ReleaseError('Public verification failed') from None


def native_digest(config, deployment):
    """Controller-only adapter: return one fixed application's digest, never logs."""
    for value in [config['project'], config['application'], deployment]:
        if not re.fullmatch(r'[a-z0-9]{20,32}', value):
            raise ReleaseError('Invalid fixed digest target')
    php = r'''<?php
require '/var/www/html/vendor/autoload.php';$app=require '/var/www/html/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$a=App\Models\Application::where('uuid','APPLICATION')->firstOrFail();
if($a->environment->project->uuid!=='PROJECT')throw new Exception('Project mismatch');
$d=App\Models\ApplicationDeploymentQueue::where('deployment_uuid','DEPLOYMENT')->where('application_id',$a->id)->firstOrFail();
$logs=is_string($d->logs)?$d->logs:json_encode($d->logs);
preg_match_all('/exporting manifest(?: list)? (sha256:[a-f0-9]{64})/',$logs,$m);
echo json_encode(['digest'=>count($m[1])?end($m[1]):null]);
'''.replace('APPLICATION', config['application']).replace('PROJECT', config['project']).replace('DEPLOYMENT', deployment)
    result = subprocess.run(['docker', 'exec', '-i', 'coolify', 'php'], input=php,
                            capture_output=True, text=True, timeout=30)
    if result.returncode:
        raise ReleaseError('Fixed digest adapter failed')
    return json.loads(result.stdout).get('digest')


class Release:
    def __init__(self, config, api, github, fetch=public, now=time.time, sleep=time.sleep, digest=None):
        self.c, self.api, self.github = config, api, github
        self.fetch, self.now, self.sleep = fetch, now, sleep
        self.digest = digest
        self.path = Path(config['state_directory']) / 'state.json'
        self.state = load(self.path)

    def save(self):
        atomic(self.path, self.state)

    def verify(self, run_id):
        if not re.fullmatch(r'[0-9]{1,20}', str(run_id)):
            raise ReleaseError('Invalid run ID')
        c = self.c
        run = self.github(f"/repos/{c['repository']}/actions/runs/{run_id}")
        if (run.get('event') not in c.get('allowed_events', ['push']) or
            run.get('head_branch') != 'main' or run.get('path') != c['workflow'] or
            run.get('name') != c['workflow_name'] or
            run.get('head_repository', {}).get('full_name', '').lower() != c['repository'].lower() or
            not re.fullmatch(r'[a-f0-9]{40}', run.get('head_sha', '')) or
            not isinstance(run.get('run_attempt'), int) or run['run_attempt'] < 1 or
            not isinstance(run.get('run_number'), int) or run['run_number'] < 1 or
            not ((run.get('status') == 'in_progress' and run.get('conclusion') is None) or
                 (run.get('status') == 'completed' and run.get('conclusion') == 'success'))):
            raise ReleaseError('Run is not an approved main release')
        result = self.github(f"/repos/{c['repository']}/actions/runs/{run_id}/attempts/{run['run_attempt']}/jobs?per_page=100")
        jobs = [j for j in result.get('jobs', []) if j['name'] == c['required_job']]
        if result.get('total_count', 0) > 100 or len(jobs) != 1 or jobs[0].get('status') != 'completed' or jobs[0].get('conclusion') != 'success':
            raise ReleaseError('Required quality job did not succeed in this attempt')
        branch = self.github(f"/repos/{c['repository']}/branches/main")
        if branch.get('commit', {}).get('sha') != run['head_sha']:
            raise ReleaseError('Run is no longer main HEAD')
        return run

    def identity(self):
        c = self.c
        app = self.api('/applications/' + c['application'])
        repository = re.sub(r'\.git$', '', app.get('git_repository', '')).removeprefix('https://github.com/').removeprefix('git@github.com:')
        origins = [c['public_url'], c.get('verification_url', c['public_url'])]
        for origin in origins:
            parsed = urllib.parse.urlsplit(origin)
            if parsed.scheme != 'https' or not parsed.hostname or parsed.username or parsed.password or parsed.query or parsed.fragment or parsed.path not in ['', '/']:
                raise ReleaseError('Invalid fixed public origin')
        h = urllib.parse.urlsplit(c['health_url'])
        expected = urllib.parse.urlsplit(origins[1])
        if (h.scheme, h.netloc) != (expected.scheme, expected.netloc) or h.query or h.fragment or h.username or h.password or h.path != c['health_path']:
            raise ReleaseError('Invalid fixed health URL')
        if (repository.lower() != c['repository'].lower() or app.get('git_branch') != 'main' or
            app.get('build_pack') != 'dockerfile' or
            app.get('settings', {}).get('is_auto_deploy_enabled') is not False or
            app.get('settings', {}).get('is_build_server_enabled') is not True or
            app.get('docker_registry_image_name') != c['image'] or
            app.get('destination', {}).get('server', {}).get('uuid') != c['server'] or
            not all(origin in str(app.get('fqdn', '')).split(',') for origin in origins)):
            raise ReleaseError('Application identity mismatch')

    def prepare(self, run_id, run):
        c = self.c
        self.identity()
        sha = run['head_sha']
        build = str(uuid.uuid4())
        tag = sha + '-' + build
        values = {'SOURCE_COMMIT': sha, 'BUILD_ID': build}
        runtime = {}
        if c.get('application_policy') == 'easycode':
            values.update(APP_ENV=c['app_env'], NEXT_PUBLIC_SERVER_URL=c['public_url'])
            if c['app_env'] == 'production':
                metadata = self.api('/applications/' + c['application'] + '/envs')
                for key in ['SMTP_HOST', 'OPENAI_API_KEY', 'PUBLIC_TRUSTED_CLIENT_IP_HEADER']:
                    if not any(e['key'] == key and e.get('is_runtime') and not e.get('is_preview') for e in metadata):
                        raise ReleaseError('Required production integration absent')
                if c['chat_region'] not in ['global', 'eu']:
                    raise ReleaseError('Invalid chat region')
                runtime.update(EMAIL_TRANSPORT='', AI_CHAT_ENABLED='true', OPENAI_CHAT_REGION=c['chat_region'],
                    OPENAI_GLOBAL_APPROVED=str(c['chat_region'] == 'global').lower(),
                    OPENAI_EU_APPROVED=str(c['chat_region'] == 'eu').lower())
        again = self.verify(run_id)
        if again['head_sha'] != sha or again['run_attempt'] != run['run_attempt']:
            raise ReleaseError('Run attempt changed before dispatch')
        route = '/applications/' + c['application']
        self.api(route, 'PATCH', {'git_commit_sha': sha, 'docker_registry_image_tag': tag, 'is_auto_deploy_enabled': False})
        data = [{'key': k, 'value': v, 'is_buildtime': True, 'is_runtime': True, 'is_preview': False} for k, v in values.items()]
        data += [{'key': k, 'value': v, 'is_buildtime': False, 'is_runtime': True, 'is_preview': False} for k, v in runtime.items()]
        self.api(route + '/envs/bulk', 'PATCH', {'data': data})
        pinned = self.api(route)
        metadata = self.api(route + '/envs')
        if pinned.get('git_commit_sha') != sha or pinned.get('docker_registry_image_tag') != tag or not all(any(e['key'] == k and e.get('is_runtime') and e.get('is_buildtime') and not e.get('is_preview') for e in metadata) for k in ['BUILD_ID', 'SOURCE_COMMIT']):
            raise ReleaseError('Release pin or build metadata not retained')
        active = {'run_id': str(run_id), 'number': run['run_number'], 'attempt': run['run_attempt'],
                  'sha': sha, 'build_id': build, 'image_tag': tag, 'started': self.now(), 'phase': 'unknown'}
        self.state['active'] = active
        self.save()  # Durable before POST: a lost response must never cause another build.
        try:
            result = self.api('/deploy', 'POST', {'uuid': c['application'], 'force': not c.get('cached_builds', False)})
            ids = [d['deployment_uuid'] for d in result.get('deployments', []) if d.get('resource_uuid') == c['application']]
            if len(ids) == 1:
                active.update(id=ids[0], phase='running')
                self.save()
        except ReleaseError:
            pass

    def ready(self, active):
        c = self.c
        status, _, body = self.fetch(c['health_url'])
        health = json.loads(body)
        if status != 200 or health.get('revision') != active['sha'] or health.get('buildId') != active['build_id']:
            return False
        origin = c.get('verification_url', c['public_url'])
        status, headers, html = self.fetch(origin)
        if status != 200 or '<html' not in html:
            return False
        tags = re.findall(r'<link\b[^>]*>', html, re.I)
        canonical = next((re.search(r'\bhref=["\']([^"\']+)', t, re.I) for t in tags if re.search(r'\brel=["\']canonical["\']', t, re.I)), None)
        if not canonical or canonical.group(1).rstrip('/') != c['public_url'].rstrip('/'):
            return False
        if c.get('app_env') == 'production':
            if origin == c['public_url'] and any(k.lower() == 'x-robots-tag' and 'noindex' in v.lower() for k, v in headers.items()):
                return False
            status, _, robots = self.fetch(origin.rstrip('/') + '/robots.txt')
            if status != 200 or re.search(r'^\s*Disallow:\s*/\s*$', robots, re.M | re.I):
                return False
            if c.get('application_policy') == 'easycode':
                status, _, chat = self.fetch(origin.rstrip('/') + '/api/ai-chat')
                if status != 200 or json.loads(chat).get('available') is not True:
                    return False
        return True

    def poll(self):
        a = self.state['active']
        if self.now() - a['started'] > 1440 or a.get('phase') == 'attention':
            a['phase'] = 'attention'
            self.save()
            raise ReleaseError('Unfinished deployment requires operator reconciliation')
        if not a.get('id'):
            result = self.api('/deployments/applications/' + self.c['application'] + '?take=100')
            rows = result if isinstance(result, list) else result.get('deployments', [])
            from datetime import datetime
            matches = [d for d in rows if d.get('commit') == a['sha'] and datetime.fromisoformat(d['created_at'].replace('Z', '+00:00')).timestamp() >= a['started'] - 2]
            if len(matches) != 1:
                return False
            a.update(id=matches[0]['deployment_uuid'], phase='running')
            self.save()
        d = self.api('/deployments/' + a['id'])
        if d.get('status') not in ['finished', 'failed', 'cancelled', 'canceled']:
            return False
        logs = d.get('logs', '')
        logs = logs if isinstance(logs, str) else json.dumps(logs)
        digests = re.findall(r'exporting manifest(?: list)? (sha256:[a-f0-9]{64})', logs)
        if not digests and self.digest:
            fixed = self.digest(a['id'])
            if fixed and re.fullmatch(r'sha256:[a-f0-9]{64}', fixed):
                digests = [fixed]
        success = d['status'] == 'finished' and d.get('commit') == a['sha'] and bool(digests)
        if success:
            try:
                success = self.ready(a)
            except Exception:
                success = False
        if not success and d['status'] == 'finished' and d.get('commit') == a['sha']:
            a.setdefault('readiness_deadline', self.now() + 60)
            self.save()
            if self.now() < a['readiness_deadline']:
                return False
        receipt = {**a, 'success': success, 'finished': self.now(), 'digest': digests[-1] if digests else None}
        self.state['last'] = receipt
        if success:
            self.state['published'] = receipt
        self.state['active'] = None
        self.save()
        atomic(Path(self.c['state_directory']) / 'runs' / (a['run_id'] + '.json'), receipt)
        if not success:
            raise ReleaseError('Deployment failed verification; no automatic rebuild')
        return True

    def finish(self):
        while self.state.get('active'):
            try:
                self.poll()
            except ReleaseError:
                if not self.state.get('active') or self.state['active'].get('phase') == 'attention':
                    raise
                if self.now() - self.state['active']['started'] > 1440:
                    self.state['active']['phase'] = 'attention'
                    self.save()
                    raise ReleaseError('Remote status unavailable; operator reconciliation required') from None
            if self.state.get('active'):
                self.sleep(5)

    def run(self, run_id):
        # Called under the same host lock as backup; recover any old dispatch first.
        self.finish()
        run = self.verify(run_id)
        previous = self.state.get('last') or self.state.get('published')
        if previous and (run['run_number'], run['run_attempt']) <= (previous.get('number', 0), previous.get('attempt', 0)):
            if str(previous.get('run_id')) != str(run_id):
                raise ReleaseError('Superseded workflow run')
            if not previous.get('success'):
                raise ReleaseError('Previous attempt failed; approve a new successful workflow attempt')
            return previous
        self.prepare(run_id, run)
        self.finish()
        return self.state['last']


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--config', required=True)
    parser.add_argument('--run-id', required=True)
    args = parser.parse_args()
    c = load(args.config)
    if c.get('enabled') is not True:
        raise ReleaseError('Project release job is not enabled')
    if fcntl is None:
        raise ReleaseError('Server execution requires POSIX file locks')
    directory = Path(c['state_directory'])
    directory.mkdir(parents=True, exist_ok=True)
    with (directory / 'operations.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        if c.get('backup_state') and load(c['backup_state']).get('active'):
            raise ReleaseError('Incomplete backup requires operator reconciliation')
        worker = Release(c, Client(c['coolify_url'], c['coolify_token']),
                         Client('https://api.github.com', c['github_token']),
                         digest=(lambda deployment: native_digest(c, deployment)) if c.get('native_digest_adapter') else None)
        receipt = worker.run(args.run_id)
        print(json.dumps({k: receipt.get(k) for k in ['success', 'sha', 'build_id', 'digest', 'id']}))


if __name__ == '__main__':
    try:
        main()
    except Exception:
        print(json.dumps({'success': False, 'error': 'Release incomplete or rejected; inspect private state and reconcile'}))
        raise SystemExit(1)
