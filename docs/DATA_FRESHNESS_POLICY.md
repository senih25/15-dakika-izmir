# Public-data provenance and freshness boundary — G-09

This independent public-benefit project is **not** an official İzmir Büyükşehir Belediyesi (İzBB) service. It displays sources recorded in `api/meta.js` and `kaggle/sources.csv`, currently attributed to the İzmir Büyükşehir Belediyesi Açık Veri Portalı under **CC BY 4.0**. The program's own MIT license does **not** relicense third-party municipal data.

## Two distinct data states

- **Live API:** `api/data.js` fetches allowlisted, external, public municipal endpoints at request time. The fact that an endpoint returns HTTP 200 is not evidence its records are current or complete.
- **Kaggle snapshot:** `kaggle/validation_report.json` records a last retrieval date of **20 September 2026**. This is historical provenance only. It must **not** be presented as today's live pharmacy/hospital/assembly coverage.
- Some duty-pharmacy entries can expire daily. A daily-changing source needs a fresh source timestamp before being described as current. Other categories use a temporary 30-day warning window, not a guarantee of correctness.

## CI safety

`test/metadata-provenance.mjs` runs **offline**, makes no municipal API requests, reads no user coordinates and verifies the allowlisted source hosts, attribution, CC BY metadata, snapshot schema and date. Out-of-date records produce `STALE_SNAPSHOT` warnings in the present **PUBLIC-BETA** stage. When `PUBLIC_STABLE=1`, the same stale data will fail the release gate.

**PUBLIC-STABLE is blocked until** a separately approved refresh and dataset-license check confirms each time-sensitive source, geography, source date, mappable coverage, help/correction mechanism and accessibility checks. Do not add automatic upstream polling or collect users' precise location as part of G-09.

## Rollback

Close this independent draft PR or revert its workflow, test, metadata note and README link. No production deployment, database, user coordinates, credentials, data downloads or external calls occur in this change.
