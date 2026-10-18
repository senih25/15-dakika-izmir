import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { sources } from "../api/meta.js";

// This test inspects only public dataset *metadata*. It does not fetch remote APIs,
// collect a user's location, or read/publish row-level service records.
const kinds = ["duty_pharmacy", "pharmacy", "hospital", "market", "assembly"];
assert.deepEqual(Object.keys(sources).sort(), [...kinds].sort());

for (const kind of kinds) {
  const source = sources[kind];
  assert.equal(source.publisher, "İzmir Büyükşehir Belediyesi");
  assert.equal(source.license, "CC BY 4.0");
  assert.match(source.licenseUrl, /^https:\/\/creativecommons\.org\/licenses\/by\/4\.0\//);
  assert.match(source.dataset, /^https:\/\/acikveri\.bizizmir\.com\/dataset\//);
  assert.match(source.endpoint, /^https:\/\/openapi\.izmir\.bel\.tr\/api\//);
  assert.equal(source.publicStatus, "PUBLIC-BETA");
  assert.ok(source.refreshNote?.trim(), `Missing refresh disclaimer: ${kind}`);
}

const raw = readFileSync(new URL("../kaggle/sources.csv", import.meta.url), "utf8");
const csvRows = raw.trim().split(/\r?\n/);
assert.equal(csvRows.length, kinds.length + 1, "Expected source header plus five layer records");
assert.match(csvRows[0], /^service_type,service_type_label,dataset_name,dataset_url,license,attribution,refresh_note/);
const sourceKinds = csvRows.slice(1).map((row) => row.split(",")[0]);
assert.deepEqual(sourceKinds.sort(), [...kinds].sort());
for (const row of csvRows.slice(1)) {
  assert.match(row, /https:\/\/acikveri\.bizizmir\.com\/dataset\//);
  assert.match(row, /CC BY 4\.0/);
  assert.match(row, /İzmir Büyükşehir Belediyesi/);
}

const receipt = JSON.parse(readFileSync(new URL("../kaggle/validation_report.json", import.meta.url), "utf8"));
const created = Date.parse(receipt.generated_at);
assert.ok(Number.isFinite(created), "Missing snapshot generation date");
const ageDays = (Date.now() - created) / 86_400_000;
assert.ok(ageDays >= -1, "Snapshot timestamp is unexpectedly in the future");
const maxAgeDays = 45;
assert.ok(ageDays <= maxAgeDays, `Snapshot is ${ageDays.toFixed(1)} days old; refresh/revalidate the public dataset (limit ${maxAgeDays} days)`);
assert.equal(receipt.checks?.license_pass, true);
assert.equal(receipt.checks?.coordinate_pass, true);
assert.equal(receipt.checks?.name_pass, true);
assert.equal(receipt.checks?.unique_id_pass, true);
assert.deepEqual([...receipt.checks.service_types].sort(), [...kinds].sort());
for (const kind of kinds) {
  assert.ok(Date.parse(receipt.service_counts?.[kind]?.retrieved_at), `Missing retrieval date: ${kind}`);
}
console.log(`PASS: five official-source attributions, licenses and PUBLIC-BETA disclaimers; snapshot age ${ageDays.toFixed(1)} days`);
console.log("NOTE: this monthly archived snapshot check is not proof of current live pharmacy duty or real-time API availability.");
