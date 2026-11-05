'use strict';
fetch('http://127.0.0.1:8080/healthz', {
  signal: AbortSignal.timeout(4000), redirect: 'error',
}).then(response => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1));
