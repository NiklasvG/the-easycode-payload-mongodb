import copy
import json
from pathlib import Path
import tempfile
import unittest
from release import Release, ReleaseError, load
from trigger import parse

SHA = 'a' * 40
DIGEST = 'sha256:' + 'b' * 64


class Fixture:
    def __init__(self):
        self.temp = tempfile.TemporaryDirectory()
        self.c = dict(state_directory=self.temp.name, application='app', repository='team/site',
            workflow='.github/workflows/quality.yml', workflow_name='Quality', required_job='Quality gate',
            image='registry/site', server='server', public_url='https://site.test',
            health_url='https://site.test/api/health/ready', health_path='/api/health/ready',
            app_env='production', application_policy='static')
        self.run = dict(event='push', head_branch='main', path=self.c['workflow'], name='Quality',
            head_repository={'full_name': 'team/site'}, head_sha=SHA, run_number=10, run_attempt=2,
            status='in_progress', conclusion=None)
        self.jobs = dict(total_count=1, jobs=[dict(name='Quality gate', status='completed', conclusion='success')])
        self.head = SHA
        self.app = dict(git_repository='team/site', git_branch='main', build_pack='dockerfile',
            settings=dict(is_auto_deploy_enabled=False, is_build_server_enabled=True),
            docker_registry_image_name='registry/site', destination={'server': {'uuid': 'server'}}, fqdn='https://site.test')
        self.variables = []
        self.calls = []
        self.clock = 1000
        self.unknown = False
        self.fail_digest = False
        self.wrong_build = False
        self.wrong_canonical = False
        self.deny_robots = False
        self.worker = Release(self.c, self.api, self.github, self.fetch,
                              lambda: self.clock, self.sleep)

    def sleep(self, seconds):
        self.clock += seconds

    def github(self, path):
        if path.endswith('/branches/main'):
            return {'commit': {'sha': self.head}}
        if '/jobs?' in path:
            return copy.deepcopy(self.jobs)
        return copy.deepcopy(self.run)

    def api(self, path, method='GET', body=None):
        self.calls.append((path, method, body))
        if path == '/applications/app':
            if method == 'PATCH':
                self.app.update(body)
            return copy.deepcopy(self.app)
        if path.endswith('/envs/bulk'):
            self.variables = body['data']
            return {}
        if path.endswith('/envs'):
            return self.variables
        if path == '/deploy':
            if self.unknown:
                raise ReleaseError('lost response')
            return {'deployments': [{'resource_uuid': 'app', 'deployment_uuid': 'deployment'}]}
        if path.startswith('/deployments/applications/'):
            return [{'commit': SHA, 'created_at': '1970-01-01T00:16:40Z', 'deployment_uuid': 'deployment'}]
        if path == '/deployments/deployment':
            return {'status': 'finished', 'commit': SHA,
                    'logs': '' if self.fail_digest else 'exporting manifest list ' + DIGEST}
        raise AssertionError(path)

    def fetch(self, url):
        if url.endswith('/api/health/ready'):
            return 200, {}, json.dumps({'revision': SHA, 'buildId': 'old' if self.wrong_build else self.worker.state['active']['build_id']})
        if url.endswith('/robots.txt'):
            return 200, {}, 'User-agent: *\n' + ('Disallow: /\n' if self.deny_robots else 'Allow: /\n')
        return 200, {}, '<html><link rel="canonical" href="' + ('https://wrong.test' if self.wrong_canonical else self.c['public_url']) + '"/></html>'


class ReleaseTests(unittest.TestCase):
    def setUp(self):
        self.f = Fixture()
        self.addCleanup(self.f.temp.cleanup)

    def test_success_exact_build_and_digest(self):
        receipt = self.f.worker.run('42')
        self.assertTrue(receipt['success'])
        self.assertEqual(receipt['digest'], DIGEST)
        self.assertEqual(load(Path(self.f.temp.name) / 'runs/42.json')['build_id'], receipt['build_id'])

    def test_duplicate_does_not_dispatch_again(self):
        self.f.worker.run('42')
        self.f.worker.run('42')
        self.assertEqual(sum(p == '/deploy' for p, _, _ in self.f.calls), 1)

    def test_rejects_untrusted_run_before_changes(self):
        for change in [{'event': 'pull_request'}, {'head_branch': 'staging'}, {'name': 'Other'},
                       {'run_attempt': 0}, {'conclusion': 'failure', 'status': 'completed'},
                       {'head_repository': {'full_name': 'foreign/site'}}]:
            with self.subTest(change=change):
                original = copy.deepcopy(self.f.run)
                self.f.run.update(change)
                with self.assertRaises(ReleaseError):
                    self.f.worker.run('42')
                self.f.run = original
        self.assertFalse(self.f.calls)

    def test_requires_current_attempt_quality(self):
        self.f.jobs['jobs'][0]['conclusion'] = 'skipped'
        with self.assertRaises(ReleaseError):
            self.f.worker.run('42')
        self.assertFalse(self.f.calls)

    def test_requires_main_head(self):
        self.f.head = 'c' * 40
        with self.assertRaises(ReleaseError):
            self.f.worker.run('42')
        self.assertFalse(self.f.calls)

    def test_identity_before_mutation(self):
        self.f.app['fqdn'] = 'https://foreign.test'
        with self.assertRaises(ReleaseError):
            self.f.worker.run('42')
        self.assertFalse(any(m == 'PATCH' for _, m, _ in self.f.calls))

    def test_unknown_dispatch_reconciles_without_second_build(self):
        self.f.unknown = True
        self.f.worker.run('42')
        self.assertEqual(sum(p == '/deploy' for p, _, _ in self.f.calls), 1)

    def test_restart_resumes_saved_dispatch(self):
        self.f.worker.prepare('42', self.f.run)
        self.f.worker = Release(self.f.c, self.f.api, self.f.github, self.f.fetch,
                                lambda: self.f.clock, self.f.sleep)
        self.f.worker.run('42')
        self.assertEqual(sum(p == '/deploy' for p, _, _ in self.f.calls), 1)

    def test_rejects_stale_build_digest_canonical_and_robots_without_rebuild(self):
        for flag in ['fail_digest', 'wrong_build', 'wrong_canonical', 'deny_robots']:
            f = Fixture()
            self.addCleanup(f.temp.cleanup)
            setattr(f, flag, True)
            with self.subTest(flag=flag), self.assertRaises(ReleaseError):
                f.worker.run('42')
            self.assertFalse(f.worker.state['last']['success'])
            self.assertEqual(sum(p == '/deploy' for p, _, _ in f.calls), 1)

    def test_timeout_keeps_active_lock_record(self):
        self.f.worker.prepare('42', self.f.run)
        self.f.clock += 1500
        with self.assertRaises(ReleaseError):
            self.f.worker.finish()
        self.assertEqual(self.f.worker.state['active']['phase'], 'attention')

    def test_fixed_digest_adapter_avoids_sensitive_log_permission(self):
        self.f.fail_digest = True
        self.f.worker.digest = lambda deployment: DIGEST if deployment == 'deployment' else None
        self.assertEqual(self.f.worker.run('42')['digest'], DIGEST)

    def test_failed_attempt_needs_a_new_successful_workflow_attempt(self):
        self.f.fail_digest = True
        with self.assertRaises(ReleaseError):
            self.f.worker.run('42')
        self.f.fail_digest = False
        with self.assertRaises(ReleaseError):
            self.f.worker.run('42')
        self.f.run['run_attempt'] = 3
        self.assertTrue(self.f.worker.run('42')['success'])

    def test_verification_alias_must_belong_to_fixed_application(self):
        self.f.c['verification_url'] = 'https://pilot.test'
        self.f.c['health_url'] = 'https://pilot.test/api/health/ready'
        with self.assertRaises(ReleaseError):
            self.f.worker.run('42')
        self.assertFalse(any(m == 'PATCH' for _, m, _ in self.f.calls))

    def test_production_easycode_requires_integrations(self):
        self.f.c.update(application_policy='easycode', chat_region='global')
        with self.assertRaises(ReleaseError):
            self.f.worker.run('42')
        self.assertFalse(any(m == 'PATCH' for _, m, _ in self.f.calls))

    def test_forced_command_rejects_shell_and_foreign_operations(self):
        self.assertEqual(parse('release 42'), ('release', '42'))
        for command in ['sh', 'release 42; id', 'release ../secret', 'status 42\nwhoami', 'pause 42']:
            with self.subTest(command=command), self.assertRaises(ValueError):
                parse(command)


if __name__ == '__main__':
    unittest.main()
