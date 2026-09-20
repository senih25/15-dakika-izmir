import { sources } from "./meta.js";

const TIMEOUT_MS = 7000;

async function fetchWithTimeout(url, binary = false) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "15-Dakika-Izmir/0.1 public-service" }
    });
    if (!response.ok) throw new Error(`Upstream ${response.status}`);
    return binary ? new Uint8Array(await response.arrayBuffer()) : await response.json();
  } finally {
    clearTimeout(timer);
  }
}

function num(value) {
  const n = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function clean(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function normalizePharmacy(row, duty = false) {
  const lat = num(row.LokasyonX);
  const lng = num(row.LokasyonY);
  if (lat == null || lng == null) return null;
  return {
    id: `pharmacy:${row.EczaneId ?? clean(row.Adi)}:${lat}:${lng}`,
    name: clean(row.Adi),
    lat, lng,
    district: clean(row.Bolge),
    neighborhood: "",
    address: clean(row.Adres),
    phone: clean(row.Telefon),
    detail: duty ? clean(row.BolgeAciklama) : "",
    observedAt: duty ? row.Tarih ?? null : null
  };
}

function normalizeCbs(row, kind) {
  const lat = num(row.ENLEM);
  const lng = num(row.BOYLAM);
  if (lat == null || lng == null) return null;
  const address = [row.YOL, row.KAPINO].map(clean).filter(Boolean).join(" ");
  return {
    id: `${kind}:${clean(row.ILCEID)}:${clean(row.ADI)}:${lat}:${lng}`,
    name: clean(row.ADI),
    lat, lng,
    district: clean(row.ILCE),
    neighborhood: clean(row.MAHALLE),
    address,
    phone: "",
    detail: clean(row.ACIKLAMA),
    observedAt: null
  };
}

function parseDelimited(text, delimiter = ";") {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], next = text[i + 1];
    if (quoted && ch === '"' && next === '"') { field += '"'; i++; continue; }
    if (ch === '"') { quoted = !quoted; continue; }
    if (!quoted && ch === delimiter) { row.push(field); field = ""; continue; }
    if (!quoted && (ch === "\n" || ch === "\r")) {
      if (ch === "\r" && next === "\n") i++;
      row.push(field); field = "";
      if (row.some(v => v !== "")) rows.push(row);
      row = []; continue;
    }
    field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

async function fetchAssembly(source) {
  try {
    const json = await fetchWithTimeout(source.endpoint);
    return { rows: json.onemliyer ?? [], transport: "api" };
  } catch {
    const bytes = await fetchWithTimeout(source.fallback, true);
    let text = new TextDecoder("utf-8").decode(bytes);
    if (text.includes("�")) text = new TextDecoder("windows-1254").decode(bytes);
    text = text.replace(/^\uFEFF/, "");
    const parsed = parseDelimited(text, ";");
    const headers = parsed.shift().map(h => clean(h).replace(/^\?/, ""));
    const rows = parsed.map(cols => Object.fromEntries(headers.map((h, i) => [h, cols[i] ?? ""])));
    return { rows, transport: "csv-fallback" };
  }
}

export async function loadKindData(kind) {
  const source = sources[kind];
  if (!source) {
    const error = new Error("unsupported_kind");
    error.code = "UNSUPPORTED_KIND";
    throw error;
  }

  let raw, transport = "api";
  if (kind === "assembly") {
    const out = await fetchAssembly(source);
    raw = out.rows;
    transport = out.transport;
  } else {
    const json = await fetchWithTimeout(source.endpoint);
    raw = Array.isArray(json) ? json : (json.onemliyer ?? []);
  }

  const rawCount = raw.length;
  const items = raw.map(row =>
    kind === "duty_pharmacy" ? normalizePharmacy(row, true) :
    kind === "pharmacy" ? normalizePharmacy(row, false) :
    normalizeCbs(row, kind)
  ).filter(Boolean);
  const droppedCount = rawCount - items.length;

  return {
    kind,
    source: {
      label: source.label,
      dataset: source.dataset,
      license: source.license,
      attribution: source.attribution,
      refreshNote: source.refreshNote,
      transport
    },
    retrievedAt: new Date().toISOString(),
    rawCount,
    count: items.length,
    droppedCount,
    coverageStatus: droppedCount === 0 ? "COMPLETE_FOR_MAPPABLE_ROWS" : "PARTIAL_MAPPABLE_COVERAGE",
    items
  };
}

export default async function handler(req, res) {
  const kind = String(req.query?.kind ?? "duty_pharmacy");
  try {
    const payload = await loadKindData(kind);
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
    return res.status(200).json(payload);
  } catch (error) {
    if (error?.code === "UNSUPPORTED_KIND") {
      return res.status(400).json({ error: "unsupported_kind" });
    }
    return res.status(502).json({
      error: "upstream_unavailable",
      kind,
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}