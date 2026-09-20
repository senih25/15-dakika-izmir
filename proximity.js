export const PROXIMITY_KINDS = [
  "duty_pharmacy",
  "pharmacy",
  "hospital",
  "market",
  "assembly"
];

export const KIND_LABELS = {
  duty_pharmacy: "Nöbetçi eczane",
  pharmacy: "Eczane",
  hospital: "Hastane",
  market: "Semt pazarı",
  assembly: "Afet toplanma alanı"
};

export function haversineKm(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * Math.PI / 180) *
    Math.cos(b.lat * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function validPoint(item) {
  return Number.isFinite(item?.lat) && Number.isFinite(item?.lng);
}

export function summarizeProximity(byKind, origin, radiusMeters) {
  if (!Number.isFinite(origin?.lat) || !Number.isFinite(origin?.lng)) {
    throw new TypeError("origin coordinates required");
  }
  if (!Number.isFinite(radiusMeters) || radiusMeters <= 0) {
    throw new TypeError("radiusMeters must be positive");
  }

  const radiusKm = radiusMeters / 1000;
  const counts = {};
  const nearest = {};
  let total = 0;

  for (const kind of PROXIMITY_KINDS) {
    const ranked = (byKind[kind] ?? [])
      .filter(validPoint)
      .map(item => ({ ...item, distanceKm: haversineKm(origin, item) }))
      .sort((a, b) => a.distanceKm - b.distanceKm);

    const inside = ranked.filter(item => item.distanceKm <= radiusKm);
    counts[kind] = inside.length;
    total += inside.length;
    nearest[kind] = ranked[0] ?? null;
  }

  return {
    radiusMeters,
    total,
    counts,
    nearest,
    generatedAt: new Date().toISOString()
  };
}

export function shareText(summary) {
  const radius = summary.radiusMeters >= 1000
    ? `${summary.radiusMeters / 1000} km`
    : `${summary.radiusMeters} m`;
  const parts = [
    `${summary.counts.duty_pharmacy} nöbetçi eczane`,
    `${summary.counts.hospital} hastane`,
    `${summary.counts.market} semt pazarı`,
    `${summary.counts.assembly} afet toplanma alanı`
  ];
  return `İzmir'de ${radius} çevremde: ${parts.join(" · ")}. Kaynak: İzBB Açık Veri Portalı / CC BY 4.0. #İzmirYakınımda`;
}

export function formatDistance(km) {
  if (!Number.isFinite(km)) return "—";
  return km < 1
    ? `${Math.round(km * 1000)} m`
    : `${km.toFixed(km < 10 ? 1 : 0)} km`;
}
