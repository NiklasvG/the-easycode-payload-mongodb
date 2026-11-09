// Keep the command passed to Coolify free of shell quoting and expressions.
fetch('http://127.0.0.1:3000/api/health/ready', {
  signal: AbortSignal.timeout(4000),
})
  .then((response) => process.exit(response.status === 200 ? 0 : 1))
  .catch(() => process.exit(1))
