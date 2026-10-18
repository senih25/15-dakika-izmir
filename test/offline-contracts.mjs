import assert from "node:assert/strict";
import dataHandler from "../api/data.js";
import metaHandler, { sources } from "../api/meta.js";
import proximityHandler from "../api/proximity.js";

// A deliberately synthetic, network-denying fixture. Do not run the existing
// live smoke suite in CI: it calls real municipal data endpoints.
const kinds = ["duty_pharmacy", "pharmacy", "hospital", "market", "assembly"];
const requested = [];
const mockRow = {
  ENLEM: "38.4237", BOYLAM: "27.1428", ILCEID: "0", ADI: "SYNTHETIC_PLACE",
  ILCE: "SYNTHETIC_DISTRICT", MAHALLE: "SYNTHETIC_NEIGHBORHOOD"
};
const mockPharmacy = {
  LokasyonX: "38.4237", LokasyonY: "27.1428", EczaneId: "SYNTHETIC_1",
  Adi: "SYNTHETIC_PHARMACY", Tarih: "2026-01-01"
};
const fixture = new Map(kinds.map(kind => [
  sources[kind].endpoint,
  kind === "duty_pharmacy" || kind === "pharmacy" ? [mockPharmacy] : { onemliyer: [mockRow] }
]));
const originalFetch = globalThis.fetch;

globalThis.fetch = async (input) => {
  const url = String(input);
  assert.ok(fixture.has(url), "unexpected network request: " + url);
  requested.push(url);
  return { ok: true, json: async () => fixture.get(url) };
};

function res() {
  return {
    code: 200, body: null, headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.code = code; return this; },
    json(value) { this.body = value; return this; }
  };
}
try {
  const metadata = res();
  metaHandler({}, metadata);
  assert.equal(metadata.code, 200);
  assert.equal(metadata.body.mode, "PUBLIC-BETA");
  for (const kind of kinds) {
    const s = metadata.body.sources[kind];
    assert.ok(s.endpoint.startsWith("https://openapi.izmir.bel.tr/"));
    assert.ok(s.dataset.startsWith("https://acikveri.bizizmir.com/dataset/"));
    assert.equal(s.publisher, "İzmir Büyükşehir Belediyesi");
    assert.equal(s.license, "CC BY 4.0");
    assert.ok(s.licenseUrl.startsWith("https://creativecommons.org/"));
    assert.ok(s.attribution && s.refreshNote && s.publicStatus === "PUBLIC-BETA");

    const response = res();
    await dataHandler({ query: { kind } }, response);
    assert.equal(response.code, 200, kind);
    assert.equal(response.body.count, 1, kind);
    assert.equal(response.body.droppedCount, 0, kind);
    assert.ok(Number.isFinite(response.body.items[0].lat));
    assert.ok(Number.isFinite(response.body.items[0].lng));
    assert.equal(response.body.source.license, "CC BY 4.0");
    assert.equal(response.body.source.transport, "api");
    assert.ok(!Number.isNaN(Date.parse(response.body.retrievedAt)));
    assert.equal(response.body.items[0].observedAt,
      kind === "duty_pharmacy" ? "2026-01-01" : null);
  }
  const proximity = res();
  await proximityHandler({ query: {} }, proximity);
  assert.equal(proximity.code, 200);
  assert.equal(proximity.body.locationReceived, false);
  for (const kind of kinds) {
    assert.equal(proximity.body.byKind[kind].length, 1);
    assert.equal(proximity.body.meta[kind].source.license, "CC BY 4.0");
  }
  const rejected = res();
  await dataHandler({ query: { kind: "nonexistent" } }, rejected);
  assert.equal(rejected.code, 400);
  assert.equal(rejected.body.error, "unsupported_kind");

  // Upstream outage must not masquerade as a complete or fresh dataset.
  globalThis.fetch = async () => { throw new Error("synthetic upstream failure"); };
  const unavailable = res();
  await dataHandler({ query: { kind: "hospital" } }, unavailable);
  assert.equal(unavailable.code, 502);
  assert.equal(unavailable.body.error, "upstream_unavailable");

  assert.ok(requested.length >= kinds.length);
  assert.ok(requested.every(url => fixture.has(url)));
  console.log("G09 PASS: offline source attribution, retrieval timestamps, privacy and fail-closed handling");
} finally {
  globalThis.fetch = originalFetch;
}
