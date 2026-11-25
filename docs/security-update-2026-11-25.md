# Sicherheitsupdate vom 25. November 2026

Vorbereiteter Kandidat für den freigegebenen projektweiten Sicherheitsauftrag: Payload-Paketfamilie 3.94.2, Next.js-Paketfamilie 16.4.6, React/React DOM 19.3.1 und festes Node-Basisimage 24.22.3. Das gemeinsam neu aufgelöste Lockfile enthält auch den Mongoose-Sicherheitsfix.

Die bestehenden pnpm- und Releaseverfahren bleiben erhalten. Der Produktionspaket-Audit meldet für diesen Lockstand keine bekannten Schwachstellen; lokale Typ-, Lint- und 16 Deploymentprüfungen sind erfolgreich. Die vollständigen Container-/Integrations-/Browserprüfungen erfolgen über die bestehenden GitHub-Pflichtjobs vor der Mainfreigabe. Dieser Kandidat ist noch kein nachgewiesenes Produktionsrelease.

Nach Mainfreigabe müssen erfolgreicher Quality gate, genaue SHA, tatsächliche Readiness und Image-Digest über den bestehenden Releasejob nachgewiesen werden. Ein neues Appimage aktualisiert die separate Umami-Anwendung und MongoDB nicht.

Quellen: [Payload MongoDB-Fix](https://github.com/payloadcms/payload/security/advisories/GHSA-8899-x9g3-4xgr), [Mongoose-Fix](https://github.com/Automattic/mongoose/security/advisories/GHSA-pcrw-h46h-c93h), [Node-Sicherheitsrelease](https://nodejs.org/en/blog/vulnerability/november-2026-security-releases/).
