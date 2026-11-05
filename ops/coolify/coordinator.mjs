import fs from 'node:fs';
import path from 'node:path';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import http from 'node:http';
import { pathToFileURL } from 'node:url';

class FileStore {
  constructor(filename) {
    this.filename = filename;
    fs.mkdirSync(path.dirname(filename), { recursive: true });
    this.state = fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename, 'utf8')) : {};
  }
  save() {
    const tmp = this.filename + '.next';
    const fd = fs.openSync(tmp, 'w', 0o600);
    try { fs.writeFileSync(fd, JSON.stringify(this.state)); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
    fs.renameSync(tmp, this.filename);
    if (process.platform !== 'win32') {
      const directory = fs.openSync(path.dirname(this.filename), 'r');
      try { fs.fsyncSync(directory); } finally { fs.closeSync(directory); }
    }
  }
  close() {}
}

const error = (message, status = 400) => Object.assign(new Error(message), { status });
const sameSecret = (received, expected) => {
  if (!expected || !received) return false;
  const a = Buffer.from(received), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
};

class Coordinator {
  constructor({ store, targets, api, github, now = Date.now, debounceMs = 30000, fetchImpl = fetch }) {
    Object.assign(this, { store, targets, api, github, now, debounceMs, fetchImpl });
    this.chain = Promise.resolve();
    for (const name of Object.keys(targets)) {
      const s = store.state[name] ||= { approved: null, pending: null, active: null, paused: false };
      // Migrate only an observed successful release, never infer one from HEAD.
      if (!Object.hasOwn(s, 'published')) s.published = s.last?.success ? { ...s.last } : null;
    }
    store.save();
  }
  exclusive(fn) {
    const result = this.chain.then(fn);
    this.chain = result.catch(() => {});
    return result;
  }
  target(name) {
    if (!Object.hasOwn(this.targets, name)) throw error('Unknown target', 404);
    return this.targets[name];
  }
  async verifyRun(target, runId) {
    if (!/^\d+$/.test(String(runId))) throw error('Invalid run id');
    const run = await this.github(`/repos/${target.repository}/actions/runs/${runId}`);
    if (run.event !== 'push' || run.name !== target.workflowName ||
        run.head_branch !== target.branch || run.path !== target.workflow ||
        run.head_repository?.full_name?.toLowerCase() !== target.repository.toLowerCase() ||
        !/^[a-f0-9]{40}$/.test(run.head_sha)) throw error('Run is not an approved code push', 403);
    if ((run.status === 'completed' && run.conclusion === 'success') ||
        (run.status === 'in_progress' && run.conclusion == null)) {
      // The request job belongs to this workflow, so the overall run is still
      // active. Verify the finished prerequisite in this exact run attempt.
      const attempt = Number(run.run_attempt);
      if (!Number.isSafeInteger(attempt) || attempt < 1) throw error('Invalid run attempt', 403);
      const result = await this.github(`/repos/${target.repository}/actions/runs/${runId}/attempts/${attempt}/jobs?per_page=100`);
      const quality = result.jobs?.filter(job => job.name === target.requiredJob);
      if (result.total_count > 100 || quality?.length !== 1 || quality[0].status !== 'completed' || quality[0].conclusion !== 'success') throw error('Quality job did not succeed', 403);
    } else throw error('Run is not ready for deployment', 403);
    const number = Number(run.run_number);
    if (!Number.isSafeInteger(number) || number < 1) throw error('Invalid run number', 403);
    return run;
  }
  async approve(name, runId) {
    const target = this.target(name);
    const run = await this.verifyRun(target, runId);
    const s = this.store.state[name];
    const number = Number(run.run_number);
    if (s.approved && (number < s.approved.number ||
        (number === s.approved.number && Number(run.run_attempt) <= s.approved.attempt))) return { ignored: true };
    const branch = await this.github(`/repos/${target.repository}/branches/${encodeURIComponent(target.branch)}`);
    if (branch.commit?.sha !== run.head_sha) throw error('Run is no longer the branch HEAD', 409);
    s.approved = { sha: run.head_sha, number, runId: String(runId), attempt: Number(run.run_attempt) };
    s.pending = { due: this.now(), reason: 'code', retries: 0, sha: s.approved.sha };
    this.store.save();
    return { accepted: true };
  }
  async tick() {
    for (const [name, target] of Object.entries(this.targets)) {
      try { await this.step(name, target); }
      catch { console.error(JSON.stringify({ target: name, event: 'deployment_poll_or_prepare_failed' })); }
    }
  }
  async step(name, target) {
    const s = this.store.state[name];
    const publicOrigin = new URL(target.publicUrl).origin;
    const verificationOrigin = new URL(target.verificationUrl || target.publicUrl).origin;
    if (s.active) {
      const a = s.active;
      if (a.phase === 'attention') return;
      if (this.now() - a.started > 24 * 60 * 1000) {
        a.phase = 'attention';
        a.failure = 'Deployment timed out; operator reconciliation required';
        this.store.save();
        return;
      }
      if (a.phase === 'unknown') {
        // The POST may have succeeded before a connection loss. Never blindly
        // issue another deployment. Reconcile the unique request time + commit.
        const response = await this.api(`/deployments/applications/${target.uuid}?take=100`);
        const rows = Array.isArray(response) ? response : response.deployments;
        if (!Array.isArray(rows)) throw error('Unexpected deployment list');
        const matches = rows.filter(d => d.commit === a.sha && Date.parse(d.created_at) >= a.started - 2000);
        if (matches.length !== 1) return; // Requires operator reconciliation if ambiguous.
        a.id = matches[0].deployment_uuid;
        if (!a.id) return;
        a.phase = 'running'; this.store.save();
      }
      const deployment = await this.api(`/deployments/${a.id}`);
      if (!['finished', 'failed', 'cancelled', 'canceled'].includes(deployment.status)) return;
      let success = deployment.status === 'finished' && deployment.commit === a.sha;
      const logs = typeof deployment.logs === 'string' ? deployment.logs : JSON.stringify(deployment.logs || []);
      const manifests = [...logs.matchAll(/exporting manifest(?: list)? (sha256:[a-f0-9]{64})/g)];
      const digest = manifests.at(-1)?.[1];
      success = success && Boolean(digest);
      if (success) {
        try {
          const response = await this.fetchImpl(target.healthUrl, { signal: AbortSignal.timeout(10000), cache: 'no-store',
            headers: target.healthAuthorization ? { Authorization: target.healthAuthorization } : {}, redirect: 'error' });
          const health = await response.json();
          success = response.ok && health.status === 'ready' && health.revision === a.sha && health.buildId === a.buildId;
          if (success) {
            const verificationOptions = { signal: AbortSignal.timeout(10000), cache: 'no-store', redirect: 'error',
              headers: target.healthAuthorization ? { Authorization: target.healthAuthorization } : {} };
            const home = await this.fetchImpl(verificationOrigin, verificationOptions);
            const html = await home.text();
            const canonicalTag = html.match(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i)?.[0];
            const canonicalHref = canonicalTag?.match(/\bhref=["']([^"']+)["']/i)?.[1];
            const canonical = canonicalHref ? new URL(canonicalHref, publicOrigin) : null;
            success = home.status === 200 && html.includes('<html') && canonical?.origin === publicOrigin && canonical.pathname === '/';
            if (target.appEnv === 'production' && verificationOrigin === publicOrigin && /noindex/i.test(home.headers.get('x-robots-tag') || '')) success = false;
            if (success && target.appEnv === 'production') {
              const robots = await this.fetchImpl(new URL('/robots.txt', verificationOrigin), { ...verificationOptions, signal: AbortSignal.timeout(10000) });
              success = robots.ok && !/^\s*Disallow:\s*\/\s*$/im.test(await robots.text());
              const chat = await this.fetchImpl(new URL('/api/ai-chat', verificationOrigin), { ...verificationOptions, signal: AbortSignal.timeout(10000) });
              success = success && chat.ok && (await chat.json()).available === true;
            }
          }
        } catch { success = false; }
      }
      // A finished Coolify job can precede container readiness and proxy updates.
      // Keep checking the same deployment before spending another full build.
      if (!success && deployment.status === 'finished' && deployment.commit === a.sha) {
        if (!Number.isFinite(a.readinessDeadline)) {
          a.readinessDeadline = this.now() + 60000;
          this.store.save();
        }
        if (this.now() < a.readinessDeadline) return;
      }
      s.last = { sha: a.sha, buildId: a.buildId, imageTag: a.imageTag, image: `${target.image}:${a.imageTag}`, digest: digest || null, reason: a.reason, note: a.note || null, id: a.id, success, at: this.now() };
      if (success) {
        s.published = { ...s.last };
      }
      s.active = null;
      // A failed release stays visible. Never blindly dispatch another full build.
      this.store.save();
      console[success ? 'info' : 'error'](JSON.stringify({ target: name, event: success ? 'deployment_ready' : 'deployment_failed', deployment: a.id }));
    }
    if (s.paused || !target.enabled || !s.pending || !s.approved || s.pending.due > this.now()) return;
    // One project-wide slot, including unknown dispatches recovered after restart.
    if (Object.values(this.store.state).some(state => state.active)) return;
    const sha = s.pending.sha || s.approved.sha;
    if (!sha) return;
    const branch = await this.github(`/repos/${target.repository}/branches/${encodeURIComponent(target.branch)}`);
    if (branch.commit?.sha !== sha) {
      s.pending = null; this.store.save(); return;
    }
    const application = await this.api(`/applications/${target.uuid}`);
      const publicUrl = new URL(target.publicUrl);
      const health = new URL(target.healthUrl);
    const verification = new URL(target.verificationUrl || target.publicUrl);
      if (publicUrl.protocol !== 'https:' || publicUrl.username || publicUrl.password || publicUrl.search || publicUrl.hash || publicUrl.pathname !== '/' || verification.protocol !== 'https:' ||
        verification.username || verification.password || verification.search || verification.hash || verification.pathname !== '/' ||
        health.origin !== verificationOrigin || health.pathname !== '/api/health/ready' || health.search || health.hash || health.username || health.password)
      throw error('Invalid public or verification origin', 409);
    if (application.git_repository?.replace(/\.git$/, '').replace(/^https:\/\/github.com\//, '').replace(/^git@github.com:/, '').toLowerCase() !== target.repository.toLowerCase() ||
        application.git_branch !== target.branch || application.build_pack !== 'dockerfile' ||
        application.settings?.is_auto_deploy_enabled !== false || application.settings?.is_build_server_enabled !== true ||
        application.docker_registry_image_name !== target.image ||
        application.destination?.server?.uuid !== target.server ||
        ![publicOrigin, verificationOrigin].every(origin => String(application.fqdn || '').split(',').includes(origin))) throw error('Application identity or release configuration mismatch', 409);
    const verifiedRun = await this.verifyRun(target, s.approved.runId);
    if (verifiedRun.head_sha !== sha || Number(verifiedRun.run_attempt) !== s.approved.attempt) throw error('Approved run attempt changed; request the current successful attempt', 409);
    const settings = await this.api(`/applications/${target.uuid}/envs`);
    const hasRuntime = key => settings.some(v => v.key === key && !v.is_preview && v.is_runtime);
    if (target.appEnv === 'production') {
      if (!hasRuntime('SMTP_HOST') || !hasRuntime('OPENAI_API_KEY') || !hasRuntime('PUBLIC_TRUSTED_CLIENT_IP_HEADER') ||
          !['global', 'eu'].includes(target.chatRegion)) throw error('Required production integrations not configured', 409);
    }
    const buildId = randomUUID();
    const imageTag = `${sha}-${buildId}`;
    // All PATCH operations finish before dispatch. Failure keeps pending intact.
    await this.api(`/applications/${target.uuid}`, 'PATCH', { git_commit_sha: sha, docker_registry_image_tag: imageTag, is_auto_deploy_enabled: false });
    await this.api(`/applications/${target.uuid}/envs/bulk`, 'PATCH', { data: [
      { key: 'SOURCE_COMMIT', value: sha, is_buildtime: true, is_runtime: true, is_preview: false },
      { key: 'BUILD_ID', value: buildId, is_buildtime: true, is_runtime: true, is_preview: false },
      { key: 'APP_ENV', value: target.appEnv, is_buildtime: true, is_runtime: true, is_preview: false },
      { key: 'NEXT_PUBLIC_SERVER_URL', value: target.publicUrl, is_buildtime: true, is_runtime: true, is_preview: false },
      ...(target.appEnv === 'production' ? [
        { key: 'EMAIL_TRANSPORT', value: '', is_buildtime: false, is_runtime: true, is_preview: false },
        { key: 'AI_CHAT_ENABLED', value: 'true', is_buildtime: false, is_runtime: true, is_preview: false },
        { key: 'OPENAI_CHAT_REGION', value: target.chatRegion, is_buildtime: false, is_runtime: true, is_preview: false },
        { key: 'OPENAI_GLOBAL_APPROVED', value: String(target.chatRegion === 'global'), is_buildtime: false, is_runtime: true, is_preview: false },
        { key: 'OPENAI_EU_APPROVED', value: String(target.chatRegion === 'eu'), is_buildtime: false, is_runtime: true, is_preview: false },
      ] : []),
    ] });
    const pinned = await this.api(`/applications/${target.uuid}`);
    const variables = await this.api(`/applications/${target.uuid}/envs`);
    if (pinned.git_commit_sha !== sha || pinned.docker_registry_image_tag !== imageTag ||
        !variables.some(v => v.key === 'BUILD_ID' && !v.is_preview && v.is_buildtime && v.is_runtime) ||
        !variables.some(v => v.key === 'SOURCE_COMMIT' && !v.is_preview && v.is_buildtime && v.is_runtime)) throw error('Release pin or build variable metadata not retained', 409);
    s.active = { ...s.pending, sha, buildId, imageTag, started: this.now(), phase: 'unknown' };
    s.pending = null;
    this.store.save();
    try {
      // BUILD_ID changes Coolify's build configuration snapshot and the Next.js
      // ARG cache key, without discarding cached dependency layers.
      // Enable per target only after the same-commit cache proof on that server.
      const result = await this.api('/deploy', 'POST', { uuid: target.uuid, force: target.cachedBuilds !== true });
      const id = result.deployments?.find(d => d.resource_uuid === target.uuid)?.deployment_uuid;
      if (!id) throw error('Missing deployment id');
      s.active.id = id; s.active.phase = 'running'; this.store.save();
    } catch {
      console.error(JSON.stringify({ target: name, event: 'deployment_dispatch_unknown_requires_reconciliation' }));
    }
  }
}

function jsonClient(base, token) {
  return async (route, method = 'GET', body) => {
    const response = await fetch(base.replace(/\/$/, '') + route, {
      method, headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(15000), redirect: 'error',
    });
    if (!response.ok) throw error(`Remote API returned ${response.status}`, 502);
    return response.json();
  };
}

function createServer(coordinator) {
  return http.createServer(async (req, res) => {
    const send = (status, data) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(data)); };
    if (req.method === 'GET' && req.url === '/healthz') return send(200, { ready: true });
    try {
      const match = /^\/v1\/(approve|pause|resume|retry|status|reconcile)\/([a-z0-9-]+)$/.exec(req.url);
      if (!match || req.method !== 'POST') throw error('Not found', 404);
      const [, action, name] = match;
      const target = coordinator.target(name);
      const secret = action === 'approve' ? target.releaseToken : target.operationsToken;
      if (!sameSecret(req.headers.authorization, `Bearer ${secret || ''}`) || !secret) throw error('Unauthorized', 401);
      let raw = '';
      for await (const chunk of req) { raw += chunk; if (raw.length > 8192) throw error('Body too large', 413); }
      const body = raw ? JSON.parse(raw) : {};
      const result = await coordinator.exclusive(async () => {
        if (action === 'approve') return coordinator.approve(name, body.runId);
        const state = coordinator.store.state[name];
        if (action === 'status') return state;
        if (action === 'reconcile') {
          if (state.active?.phase !== 'unknown' || !/^[a-zA-Z0-9-]+$/.test(body.deploymentId || '')) throw error('No ambiguous deployment or invalid id', 409);
          const application = await coordinator.api(`/applications/${target.uuid}`);
          const deployment = await coordinator.api(`/deployments/${body.deploymentId}`);
          if (String(deployment.application_id) !== String(application.id) || deployment.commit !== state.active.sha || Date.parse(deployment.created_at) < state.active.started - 2000) throw error('Deployment does not match active request', 409);
          state.active.id = body.deploymentId; state.active.phase = 'running';
          coordinator.store.save(); return { accepted: true };
        }
        if (action === 'retry') {
          if (state.active) throw error('Active/unknown deployment must be reconciled first', 409);
          if (typeof body.reason !== 'string' || !body.reason.trim()) throw error('Manual retry requires a reason');
          state.pending = { due: coordinator.now(), reason: 'manual', sha: state.approved?.sha, note: body.reason.trim().slice(0, 200), retries: 0 };
          console.info(JSON.stringify({ target: name, event: 'manual_retry' }));
        } else state.paused = action === 'pause';
        coordinator.store.save(); return { accepted: true };
      });
      send(202, result);
    } catch (e) { send(e.status || 400, { error: e.status ? e.message : 'Invalid request' }); }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const targets = JSON.parse(process.env.TARGETS_JSON || fs.readFileSync(process.env.TARGETS_FILE || '/config/targets.json', 'utf8'));
  for (const target of Object.values(targets)) {
    target.releaseToken = process.env[target.releaseTokenEnv];
    target.operationsToken = process.env[target.operationsTokenEnv];
    target.healthAuthorization = process.env[target.healthAuthorizationEnv];
    if (!target.uuid || !target.repository || target.branch !== 'main' || !target.workflow || !target.workflowName || !target.requiredJob || !target.server || !target.image || !['staging', 'production'].includes(target.appEnv) || !target.publicUrl || !target.releaseToken || !target.operationsToken || !target.healthUrl) throw error('Incomplete target configuration');
  }
  const store = new FileStore(process.env.STATE_FILE || '/data/state.json');
  const coordinator = new Coordinator({ store, targets,
    api: (route, method, body) => jsonClient(process.env.COOLIFY_API_URL,
      route === '/deploy' ? (process.env.COOLIFY_DEPLOY_TOKEN || process.env.COOLIFY_API_TOKEN) : process.env.COOLIFY_API_TOKEN)(route, method, body),
    github: jsonClient('https://api.github.com', process.env.GITHUB_READ_TOKEN),
  });
  const server = createServer(coordinator);
  const timer = setInterval(() => coordinator.exclusive(() => coordinator.tick()).catch(() => console.error('Coordinator tick failed')), 5000);
  server.listen(Number(process.env.PORT || 8080), '0.0.0.0');
  const stop = () => { clearInterval(timer); server.close(() => coordinator.chain.finally(() => { store.close(); process.exit(); })); };
  process.once('SIGTERM', stop); process.once('SIGINT', stop);
}

export { Coordinator, FileStore, createServer, sameSecret };
