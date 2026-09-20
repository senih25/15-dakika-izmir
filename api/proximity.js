import { loadKindData } from "./data.js";

const KINDS = [
  "duty_pharmacy",
  "pharmacy",
  "hospital",
  "market",
  "assembly"
];

export default async function handler(req, res) {
  try {
    const results = await Promise.all(KINDS.map(kind => loadKindData(kind)));
    const byKind = {};
    const meta = {};

    for (const data of results) {
      byKind[data.kind] = data.items.map(item => ({
        name: item.name,
        lat: item.lat,
        lng: item.lng
      }));
      meta[data.kind] = {
        retrievedAt: data.retrievedAt,
        count: data.count,
        droppedCount: data.droppedCount,
        source: {
          label: data.source.label,
          dataset: data.source.dataset,
          license: data.source.license
        }
      };
    }

    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
    return res.status(200).json({
      mode: "privacy-safe-client-proximity",
      locationReceived: false,
      byKind,
      meta
    });
  } catch (error) {
    return res.status(502).json({
      error: "proximity_sources_unavailable",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
