import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { sources } from "../api/meta.js";

const allowedHost = new Set(["openapi.izmir.bel.tr", "acikveri.bizizmir.com"]);
const kinds = ["duty_pharmacy", "pharmacy", "hospital", "market", "assembly"];

for (const kind of kinds) {
  const source = sources[kind];
  assert.ok(source, `Missing source metadata for ${kind}`);
  assert.equal(source.publisher, "İzmir Büyükşehir Belediyesi");
  assert.equal(source.license, "CC BY 4.0");
  assert.ok(source.licenseUrl?.startsWith("https://creativecommons.org/licenses/by/4.0/"));
  assert.ok(source.attribution?.includes("İzmir Büyükşehir Belediyesi"));
  assert.equal(source.publicStatus, "PUBLIC-BETA");
  assert.ok(source.refreshNote?.length > 15, `Missing freshness disclosure: ${kind}`);
  for (const key of ["endpoint", "dataset"]) {
    const url = new URL(source[key]);
    assert.equal(url.protocol, "https:");
    assert.ok(allowedHost.has(url.hostname), `Unexpected publisher host: ${url.hostname}`);
  }
}

const report = JSON.parse(readFileSync(new URL("../kaggle/validation_report.json", import.meta.url), "utf8"));
const captured = Date.parse(report.generated_at);
assert.ok(Number.isFinite(captured), "Historical QA report timestamp missing");
assert.ok(captured <= Date.now(), "QA report timestamp in the future");
assert.ok(Object.keys(report.service_counts).every((kind) => kinds.includes(kind)));
assert.equal(report.checks.license_pass, true);
assert.equal(report.checks.coordinate_pass, true);
const ageDays = Math.floor((Date.now() - captured) / 86_400_000);
console.log(`PASS: ${kinds.length} official data source contracts; historical report age ${ageDays} days`);
if (ageDays > 7) {
  console.warn("STALE BASELINE: validation_report.json is a historical snapshot, NOT proof of current data freshness.");
}
// The reporting baseline is historical by design; CI must not call upstream APIs,
// claim current availability, or rewrite evidence to hide staleness.
