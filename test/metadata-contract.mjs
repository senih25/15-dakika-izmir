import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { sources } from "../api/meta.js";

// Offline public-metadata checks: no live IzBB requests, GPS, cookies, or user records.
const expected = ["duty_pharmacy", "pharmacy", "hospital", "market", "assembly"];
assert.deepEqual(Object.keys(sources).sort(), [...expected].sort());
for (const [kind, meta] of Object.entries(sources)) {
  for (const key of ["publisher", "portal", "license", "licenseUrl", "attribution", "dataset", "refreshNote", "publicStatus"]) {
    assert.equal(typeof meta[key], "string", `Missing ${kind}.${key}`);
    assert.ok(meta[key].trim(), `Blank ${kind}.${key}`);
  }
  for (const key of ["portal", "licenseUrl", "dataset", "endpoint"]) {
    assert.equal(new URL(meta[key]).protocol, "https:", `Unsafe ${kind}.${key} URL`);
  }
  assert.match(meta.publisher, /İzmir Büyükşehir Belediyesi/);
  assert.match(meta.attribution, /İzmir Büyükşehir Belediyesi/);
  assert.equal(meta.publicStatus, "PUBLIC-BETA");
}

const lines = readFileSync(new URL("../kaggle/sources.csv", import.meta.url), "utf8").trim().split(/\r?\n/);
assert.equal(lines[0].split(",")[0], "service_type");
const sourceTypes = lines.slice(1).map(line => line.split(",")[0]);
assert.deepEqual([...new Set(sourceTypes)].sort(), [...expected].sort(), "CSV and live source catalogs disagree");

function classifyAge(snapshotDate, now) {
  const generated = Date.parse(snapshotDate);
  assert.ok(Number.isFinite(generated), "Invalid/missing snapshot date");
  const days = (now - generated) / 86400000;
  assert.ok(days >= -1, "Snapshot is unexpectedly in the future");
  return { days, status: days <= 7 ? "RECENT" : days <= 30 ? "AGING" : "STALE" };
}
assert.equal(classifyAge("2026-01-01T00:00:00Z", Date.parse("2026-01-02T00:00:00Z")).status, "RECENT");
assert.equal(classifyAge("2026-01-01T00:00:00Z", Date.parse("2026-01-15T00:00:00Z")).status, "AGING");
assert.equal(classifyAge("2026-01-01T00:00:00Z", Date.parse("2026-03-01T00:00:00Z")).status, "STALE");

const report = JSON.parse(readFileSync(new URL("../kaggle/validation_report.json", import.meta.url), "utf8"));
assert.deepEqual(Object.keys(report.service_counts).sort(), [...expected].sort());
assert.equal(report.checks.license_pass, true);
assert.equal(report.checks.coordinate_pass, true);
const age = classifyAge(report.generated_at, Date.now());
console.log(`ARCHIVED_SNAPSHOT ${age.status}: ${age.days.toFixed(1)} days old (not runtime API freshness)`);
if (age.days > 2) console.warn("FRESHNESS_REVIEW: historical snapshot cannot support current duty-pharmacy claims");
console.log("PASS: license, attribution, source identity, synthetic freshness contract");
