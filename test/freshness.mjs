import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { sources } from "../api/meta.js";

const report = JSON.parse(readFileSync(new URL("../kaggle/validation_report.json", import.meta.url), "utf8"));
const expected = ["duty_pharmacy", "pharmacy", "hospital", "market", "assembly"];
const maxMonthlySnapshotAgeDays = 45;
const DAY_MS = 86_400_000;

assert.deepEqual(Object.keys(sources).sort(), expected.slice().sort(), "Unexpected live source catalog");
assert.deepEqual(Object.keys(report.service_counts).sort(), expected.slice().sort(), "Snapshot coverage changed");
const stamp = Date.parse(report.generated_at);
assert.ok(Number.isFinite(stamp) && stamp <= Date.now(), "Missing or future snapshot generation timestamp");
const ageDays = (Date.now() - stamp) / DAY_MS;
assert.ok(ageDays <= maxMonthlySnapshotAgeDays,
  "Monthly open-data snapshot exceeds 45 days; refresh/revalidate before describing it as current");

for (const kind of expected) {
  const source = sources[kind];
  const count = report.service_counts[kind];
  assert.equal(source.publisher, "İzmir Büyükşehir Belediyesi");
  assert.equal(source.license, "CC BY 4.0");
  assert.match(source.attribution, /İzmir Büyükşehir Belediyesi/);
  assert.match(source.dataset, /^https:\/\/acikveri\.bizizmir\.com\/dataset\//);
  assert.match(source.licenseUrl, /^https:\/\/creativecommons\.org\/licenses\/by\/4\.0\//);
  assert.equal(source.publicStatus, "PUBLIC-BETA");
  assert.ok(count.raw_count >= count.mappable_count && count.mappable_count >= 0);
  const retrieved = Date.parse(count.retrieved_at);
  assert.ok(Number.isFinite(retrieved) && retrieved <= Date.now(), kind + ": invalid retrieval timestamp");
  assert.ok(retrieved <= stamp + DAY_MS, kind + ": retrieval after snapshot timestamp");
}

assert.equal(report.checks.license_pass, true);
assert.equal(report.checks.coordinate_pass, true);
assert.equal(report.checks.unique_id_pass, true);
console.log("PASS: five İzBB source attributions and monthly snapshot freshness (" + ageDays.toFixed(1) + " days)");
console.log("NOTE: historical duty-pharmacy snapshot is NOT evidence of which pharmacy is on duty today");
