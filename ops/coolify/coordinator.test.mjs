import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Coordinator, createServer } from './coordinator.mjs';

const sha = 'a'.repeat(40);
const digest = `sha256:${'b'.repeat(64)}`;
const target = {
  uuid: 'app', repository: 'team/site', branch: 'main', workflow: '.github/workflows/quality.yml',
  workflowName: 'Quality', requiredJob: 'Quality gate', kind: 'backend', enabled: true,
  image: 'registry.test/site', server: 'appserver', publicUrl: 'https://site.test',
  healthUrl: 'https://site.test/api/health/ready', releaseToken: 'test-only-release-token',
  operationsToken: 'test-only-operations-token',
  appEnv: 'staging',
};
function fixture(overrides = {}) {
  let now = 1000;
  const calls = [];
  const store = { state: {}, save() {} };
  const app = {
    id: 1, git_repository: 'team/site', git_branch: 'main', build_pack: 'dockerfile',
    settings: { is_auto_deploy_enabled: false, is_build_server_enabled: true },
    docker_registry_image_name: target.image, destination: { server: { uuid: target.server } },
    fqdn: target.publicUrl,
    ...overrides.app,
  };
  let variables = [
    { key: 'APP_ENV', value: 'staging', is_preview: false, is_buildtime: true, is_runtime: true },
    { key: 'NEXT_PUBLIC_SERVER_URL', value: target.publicUrl, is_preview: false, is_buildtime: true, is_runtime: true },
    ...['SMTP_HOST', 'OPENAI_API_KEY', 'PUBLIC_TRUSTED_CLIENT_IP_HEADER'].map(key => ({ key, value: 'test-only-value', is_runtime: true, is_preview: false })),
  ];
  const run = {
    event: 'push', name: 'Quality', path: target.workflow, head_branch: 'main',
    head_repository: { full_name: 'team/site' }, head_sha: sha, run_attempt: 2,
    run_number: 3, status: 'in_progress', conclusion: null, ...overrides.run,
  };
  const jobs = overrides.jobs || { total_count: 1, jobs: [{ name: 'Quality gate', status: 'completed', conclusion: 'success' }] };
  const github = async path => {
    calls.push({ github: path });
    if (path.endsWith('/branches/main')) return { commit: { sha: overrides.head || sha } };
    if (/\/attempts\/\d+\/jobs/.test(path)) return jobs;
    if (path.endsWith('/actions/runs/42')) return run;
    throw new Error(`Unexpected GitHub path ${path}`);
  };
  const api = async (path, method = 'GET', body) => {
    calls.push({ path, method, body });
    if (path === '/applications/app') {
      if (method === 'PATCH') Object.assign(app, body);
      return { ...app, ...(overrides.lostPin && method === 'GET' ? { git_commit_sha: 'HEAD' } : {}) };
    }
    if (path.endsWith('/envs/bulk')) { variables = [...variables.filter(v => !body.data.some(x => x.key === v.key)), ...body.data]; return {}; }
    if (path.endsWith('/envs')) return overrides.redactValues ? variables.map(v => ({ ...v, value: null })) : variables;
    if (path === '/deploy') {
      if (overrides.dispatchUnknown) throw new Error('connection lost');
      return { deployments: [{ resource_uuid: 'app', deployment_uuid: 'deployment' }] };
    }
    if (path.startsWith('/deployments/applications/'))
      return [{ commit: sha, created_at: new Date(1000).toISOString(), deployment_uuid: 'deployment' }];
    if (path === '/deployments/deployment') return {
      status: overrides.status || 'finished', commit: overrides.deployedSha || sha,
      logs: overrides.missingDigest ? '' : `exporting manifest ${digest}`,
    };
    throw new Error(`Unexpected API path ${path}`);
  };
  const fetchImpl = async url => {
    const active = store.state.website.active;
    if (url === target.publicUrl) return new Response('<html>Site</html>');
    if (new URL(url).pathname === '/api/ai-chat') return Response.json({ available: true });
    return Response.json({ status: 'ready', revision: sha, buildId: overrides.wrongBuild ? 'old-build' : active.buildId });
  };
  const coordinator = new Coordinator({ store, targets: { website: { ...target } }, api, github, fetchImpl, now: () => now });
  return { coordinator, store, calls, app, run, overrides, advance: ms => { now += ms; } };
}
test('checks the exact current attempt and releases a unique build with a digest', async () => {
  const h = fixture();
  assert.deepEqual(await h.coordinator.approve('website', 42), { accepted: true });
  assert(h.calls.some(x => x.github?.includes('/attempts/2/jobs')));
  await h.coordinator.step('website', target);
  const active = { ...h.store.state.website.active };
  assert.equal(h.app.docker_registry_image_tag, `${sha}-${active.buildId}`);
  assert.deepEqual(h.calls.find(x => x.path === '/deploy').body, { uuid: 'app', force: true });
  await h.coordinator.step('website', target);
  assert.equal(h.store.state.website.published.digest, digest);
  assert.equal(h.store.state.website.published.sha, sha);
  assert.equal(h.store.state.website.active, null);
});
for (const [name, override] of [
  ['pull request', { run: { event: 'pull_request' } }],
  ['manual run', { run: { event: 'workflow_dispatch' } }],
  ['foreign repository', { run: { head_repository: { full_name: 'attacker/site' } } }],
  ['wrong workflow', { run: { path: '.github/workflows/other.yml' } }],
  ['wrong branch', { run: { head_branch: 'staging' } }],
  ['failed run', { run: { status: 'completed', conclusion: 'failure' } }],
  ['failed quality', { jobs: { jobs: [{ name: 'Quality gate', status: 'completed', conclusion: 'failure' }] } }],
  ['skipped quality', { jobs: { jobs: [{ name: 'Quality gate', status: 'completed', conclusion: 'skipped' }] } }],
  ['missing quality', { jobs: { jobs: [] } }],
  ['old commit', { head: 'c'.repeat(40) }],
]) test(`rejects ${name} before any Coolify mutation`, async () => {
  const h = fixture(override);
  await assert.rejects(h.coordinator.approve('website', 42));
  assert.equal(h.calls.some(x => x.path), false);
});
test('rechecks branch HEAD after queuing and ignores a superseded release', async () => {
  const options = {};
  const h = fixture(options);
  await h.coordinator.approve('website', 42);
  options.head = 'c'.repeat(40);
  await h.coordinator.step('website', target);
  assert.equal(h.calls.some(x => x.path), false);
  assert.equal(h.store.state.website.pending, null);
});
test('production releases work with redacted env values and explicitly set the selected global chat', async () => {
  const h = fixture({ redactValues: true });
  const production = { ...target, appEnv: 'production', chatRegion: 'global' };
  h.coordinator.targets.website = production;
  await h.coordinator.approve('website', 42);
  await h.coordinator.step('website', production);
  const values = Object.fromEntries(h.calls.find(x => x.path?.endsWith('/envs/bulk')).body.data.map(x => [x.key, x.value]));
  assert.equal(values.APP_ENV, 'production');
  assert.equal(values.OPENAI_CHAT_REGION, 'global');
  assert.equal(values.OPENAI_GLOBAL_APPROVED, 'true');
  assert.equal(values.OPENAI_EU_APPROVED, 'false');
  assert.equal(values.OPENAI_API_KEY, undefined, 'The coordinator must not read or replace the provider credential');
  await h.coordinator.step('website', production);
  assert.equal(h.store.state.website.published.success, true);
});
test('a later run attempt must be verified and explicitly approved before dispatch', async () => {
  const h = fixture();
  await h.coordinator.approve('website', 42);
  h.run.run_attempt = 3;
  await assert.rejects(h.coordinator.step('website', target), /attempt changed/);
  assert.equal(h.calls.some(x => x.path === '/deploy'), false);
  await h.coordinator.approve('website', 42);
  await h.coordinator.step('website', target);
  assert.equal(h.calls.filter(x => x.path === '/deploy').length, 1);
});
test('rejects a different application server and a lost commit pin', async () => {
  for (const options of [{ app: { destination: { server: { uuid: 'foreign-server' } } } }, { lostPin: true }]) {
    const h = fixture(options);
    await h.coordinator.approve('website', 42);
    await assert.rejects(h.coordinator.step('website', target));
    assert.equal(h.calls.some(x => x.path === '/deploy'), false);
  }
});
test('recovers an ambiguous dispatch without creating a second deployment', async () => {
  const h = fixture({ dispatchUnknown: true });
  await h.coordinator.approve('website', 42);
  await h.coordinator.step('website', target);
  assert.equal(h.store.state.website.active.phase, 'unknown');
  await h.coordinator.step('website', target);
  assert.equal(h.calls.filter(x => x.path === '/deploy').length, 1);
  assert.equal(h.store.state.website.published.success, true);
});
for (const [name, options] of [['missing digest', { missingDigest: true }], ['stale build', { wrongBuild: true }]])
  test(`holds readiness for 60 seconds then rejects ${name} without rebuilding`, async () => {
    const h = fixture(options);
    await h.coordinator.approve('website', 42);
    await h.coordinator.step('website', target);
    await h.coordinator.step('website', target);
    assert(h.store.state.website.active);
    h.advance(61000);
    await h.coordinator.step('website', target);
    assert.equal(h.store.state.website.last.success, false);
    assert.equal(h.store.state.website.published, null);
    assert.equal(h.calls.filter(x => x.path === '/deploy').length, 1);
  });
test('keeps a timed-out deployment locked for operator reconciliation', async () => {
  const h = fixture({ status: 'in_progress' });
  await h.coordinator.approve('website', 42);
  await h.coordinator.step('website', target);
  h.advance(25 * 60000);
  await h.coordinator.step('website', target);
  assert.equal(h.store.state.website.active.phase, 'attention');
  assert.equal(h.calls.filter(x => x.path === '/deploy').length, 1);
});
test('authenticated pause blocks pending releases and unauthorized requests cannot change state', async t => {
  const h = fixture();
  const server = createServer(h.coordinator);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const url = `http://127.0.0.1:${server.address().port}/v1/pause/website`;
  assert.equal((await fetch(url, { method: 'POST' })).status, 401);
  assert.equal((await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${target.releaseToken}` } })).status, 401);
  const response = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${target.operationsToken}` } });
  assert.equal(response.status, 202);
  await h.coordinator.approve('website', 42);
  await h.coordinator.step('website', target);
  assert.equal(h.calls.some(x => x.path === '/deploy'), false);
});
