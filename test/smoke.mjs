import dataHandler from "../api/data.js";
import metaHandler from "../api/meta.js";

function mockReq(query = {}) { return { query }; }
function mockRes() {
  return {
    code: 200, body: null, headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; }
  };
}

const metaRes = mockRes();
metaHandler(mockReq(), metaRes);
if (metaRes.code !== 200 || !metaRes.body?.sources?.duty_pharmacy) throw new Error("meta handler failed");

for (const kind of ["duty_pharmacy", "hospital", "market", "pharmacy", "assembly"]) {
  const res = mockRes();
  await dataHandler(mockReq({ kind }), res);
  if (res.code !== 200) throw new Error(`${kind} HTTP ${res.code}: ${JSON.stringify(res.body)}`);
  if (!Array.isArray(res.body.items) || res.body.items.length === 0) throw new Error(`${kind} returned no items`);
  const item = res.body.items[0];
  if (!Number.isFinite(item.lat) || !Number.isFinite(item.lng)) throw new Error(`${kind} invalid coordinates`);
  console.log(`PASS ${kind}: ${res.body.items.length} records`);
}

const bad = mockRes();
await dataHandler(mockReq({ kind: "anything" }), bad);
if (bad.code !== 400) throw new Error("unknown kind must fail closed");
console.log("PASS unknown-kind fail-closed");
console.log("SMOKE PASS");
