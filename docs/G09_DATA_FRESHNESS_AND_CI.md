# G-09 — Source freshness, attribution, and release limits

**Release scope:** PUBLIC-BETA. This document is an evidence/CI boundary, not a claim that any municipal dataset is up to date or complete.

## Canonical data provenance

The five map layers are served from four dataset families published by **İzmir Büyükşehir Belediyesi Açık Veri Portalı**. The exact API endpoint and dataset URL, attribution text, `CC BY 4.0` declaration, and publisher-specific refresh note are recorded per layer in [`api/meta.js`](../api/meta.js). Underlying publisher terms still apply; recheck them before commercial reuse or redistribution.

| Layer | Dataset family | Update caution |
| --- | --- | --- |
| Duty pharmacies | Nöbetçi eczaneler / eczane listesi | Duty shifts are date-scoped; the API response's `Tarih` is the only row observation timestamp exposed here. |
| Pharmacies | Eczane listesi | No row-level observation date in the current normalized contract. |
| Hospitals | Sağlık kurumları | Publisher frequency is irregular; no freshness assertion. |
| Markets | Semt pazar yerleri | Day/time descriptions are publisher text; revalidate locally before use. |
| Assembly areas | Afet ve acil durum toplanma alanları | API or official licensed CSV fallback; the two transports are not proof of identical update dates. |

**Important distinction:** `/api/data` returns `retrievedAt`, the time this application fetched a source. It is **not** proof of municipal last-modified or last-verified information. `observedAt` is currently populated from the duty-pharmacy `Tarih` field only; `null` for other kinds means **unknown**, not current.

Invalid/geographically incomplete rows are excluded from the map, reported as `droppedCount`, and must not be interpreted as facilities not existing. The client calculates distances: personal geolocation is not sent to the server. Neither airport routing nor guaranteed walking-time claims are supported.

## Offline CI gates

`node test/offline-contracts.mjs` replaces live municipal API calls with synthetic fixture records and intercepts `fetch`; any unexpected URL fails immediately. It checks source attribution, status, spatial shape, `retrievedAt` format, duty-row date, fail-closed source outages, unsupported layer handling, and `locationReceived=false` response. `npm run check` parses JavaScript syntax.

The existing `npm test` / `test/smoke.mjs` invokes live public municipal endpoints. **Do not run that test in CI** or present its availability as proof of dataset freshness. Use it only with explicit manual network-test authorization.

## PUBLIC-STABLE acceptance (still pending)

- An independent dated freshness audit with defensible publisher-reported last-updated fields.
- License and attribution verification per dataset and any CSV fallback.
- Coordinate/district QA, missing-row thresholds, accessibility and mobile tests.
- Source correction/redress link, reproducibility and a signed-off release manifest.

A passing CI run proves only deterministic contract integrity, **not** live correctness, municipal service continuity, safety suitability in an emergency, or production readiness.

**Rollback:** close this separate draft PR; no production, registry or data mutations are included.
