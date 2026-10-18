import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { sources } from "../api/meta.js";

const kinds = ["duty_pharmacy", "pharmacy", "hospital", "market", "assembly"];
const snapshot = JSON.parse(await readFile(new URL("../kaggle/validation_report.json", import.meta.url), "utf8"));
const sourceRows = await readFile(new URL("../kaggle/sources.csv", import.meta.url), "utf8");
const daysSince = (text) => (Date.now() - Date.parse(text)) / 86_400_000;
const stale = [];

assert.deepEqual(Object.keys(sources).sort(), kinds.slice().sort());
assert.equal(snapshot.checks.license_pass, true);
assert.equal(snapshot.checks.coordinate_pass, true);
assert.equal(snapshot.checks.unique_id_pass, true);
assert.equal(snapshot.checks.name_pass, true);
assert.ok(sourceRows.startsWith("service_type,service_type_label,dataset_name,dataset_url,license,attribution,refresh_note"));

for (const kind of kinds) {
  const source = sources[kind];
  assert.equal(source.publisher, "İzmir Büyükşehir Belediyesi");
  assert.equal(source.license, "CC BY 4.0");
  assert.equal(source.attribution, "İzmir Büyükşehir Belediyesi Açık Veri Portalı");
  assert.match(source.dataset, /^https:\/\/acikveri\.bizizmir\.com\/dataset\//);
  assert.match(source.endpoint, /^https:\/\/openapi\.izmir\.bel\.tr\/api\//);
  assert.ok(sourceRows.split(/\r?\n/).some((line) => line.startsWith(kind + ",")), kind + " source missing");
  const record = snapshot.service_counts[kind];
  assert.ok(record?.retrieved_at, kind + " retrieval timestamp missing");
  assert.ok(record.mappable_count > 0, kind + " missing mappable records");
  const age = daysSince(record.retrieved_at);
  assert.ok(Number.isFinite(age) && age >= -1, kind + " timestamp invalid");
  // Existing data snapshot is NOT live municipal API freshness.
  const maxAgeDays = kind === "duty_pharmacy" ? 1 : 30;
  if (age > maxAgeDays) stale.push({ kind, ageDays: Math.floor(age), maxAgeDays });
}
console.log("PASS: municipal source allowlist, CC BY attribution, spatial metadata and coverage");
if (stale.length) {
  console.warn("STALE_SNAPSHOT: " + stale.map((x) => x.kind + " " + x.ageDays + "d > " + x.maxAgeDays + "d").join("; "));
  // An independent PUBLIC-STABLE release requires a separately authorized,
  // current upstream refresh with provenance; do not silently auto-refresh.
  if (process.env.PUBLIC_STABLE === "1") {
    throw new Error("PUBLIC-STABLE prohibited: snapshot freshness gate failed");
  }
}
console.log("PASS: current PUBLIC-BETA source disclosure; no remote fetch or user coordinates read");
