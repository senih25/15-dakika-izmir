import {
  KIND_LABELS,
  haversineKm,
  summarizeProximity,
  shareText,
  formatDistance
} from "./proximity.js";

const state = {
  kind: "duty_pharmacy",
  items: [],
  userLocation: null,
  source: null,
  retrievedAt: null,
  lifeRadius: 1000,
  lifeData: null,
  lifeSummary: null
};

const els = {
  kind: document.querySelector("#kindSelect"),
  search: document.querySelector("#searchInput"),
  limit: document.querySelector("#limitSelect"),
  locate: document.querySelector("#locateBtn"),
  status: document.querySelector("#liveStatus"),
  list: document.querySelector("#resultsList"),
  source: document.querySelector("#sourceSummary"),
  lifeButton: document.querySelector("#lifeCardBtn"),
  lifeStatus: document.querySelector("#lifeCardStatus"),
  lifeTitle: document.querySelector("#lifeCardTitle"),
  lifeCounts: document.querySelector("#lifeCardCounts"),
  lifeNearest: document.querySelector("#lifeCardNearest"),
  lifeEvidence: document.querySelector("#lifeCardEvidence"),
  shareCard: document.querySelector("#shareCardBtn"),
  downloadCard: document.querySelector("#downloadCardBtn"),
  radiusButtons: [...document.querySelectorAll(".radius-btn")]
};

const map = L.map("map", { preferCanvas: true }).setView([38.4237, 27.1428], 10);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> katkıcıları'
}).addTo(map);
const markerLayer = L.layerGroup().addTo(map);
let userMarker = null;

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));
}

function distanceLabel(km) {
  if (km == null) return "";
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(km < 10 ? 1 : 0)} km`;
}

function sourceTimeLabel(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("tr-TR");
}
function filteredItems() {
  const q = els.search.value.trim().toLocaleLowerCase("tr-TR");
  const limit = Number(els.limit.value);
  return state.items
    .map(item => ({
      ...item,
      distanceKm: state.userLocation ? haversineKm(state.userLocation, item) : null
    }))
    .filter(item => {
      if (!q) return true;
      return [item.name, item.district, item.neighborhood, item.address, item.detail]
        .some(v => String(v ?? "").toLocaleLowerCase("tr-TR").includes(q));
    })
    .sort((a, b) => {
      if (a.distanceKm != null && b.distanceKm != null) return a.distanceKm - b.distanceKm;
      return a.name.localeCompare(b.name, "tr");
    })
    .slice(0, limit);
}

function popupHtml(item) {
  return `<strong>${esc(item.name)}</strong><br>
    <span>${esc([item.neighborhood, item.district].filter(Boolean).join(" · "))}</span><br>
    <span>${esc(item.address)}</span>`;
}
function render() {
  const items = filteredItems();
  markerLayer.clearLayers();
  els.list.innerHTML = "";

  if (!items.length) {
    els.list.innerHTML = '<li class="empty">Bu filtreyle eşleşen kayıt bulunamadı.</li>';
    return;
  }

  const bounds = [];
  items.forEach((item, index) => {
    const marker = L.marker([item.lat, item.lng]).bindPopup(popupHtml(item));
    marker.addTo(markerLayer);
    bounds.push([item.lat, item.lng]);

    const li = document.createElement("li");
    li.className = "result-card";
    const tel = item.phone ? `<a href="tel:${esc(item.phone)}">Ara</a>` : "";
    const osm = `https://www.openstreetmap.org/?mlat=${item.lat}&mlon=${item.lng}#map=18/${item.lat}/${item.lng}`;
    li.innerHTML = `
      <button type="button" data-index="${index}" aria-label="${esc(item.name)} haritada göster">
        <span class="result-top">
          <span class="result-name">${esc(item.name)}</span>
          <span class="distance">${distanceLabel(item.distanceKm)}</span>
        </span>
        <span class="result-meta">${esc([item.neighborhood, item.district].filter(Boolean).join(" · "))}</span>
        <span class="result-meta">${esc(item.address)}</span>
        ${item.detail ? `<span class="result-detail">${esc(item.detail)}</span>` : ""}
        ${item.observedAt ? `<span class="result-detail">Kaynak zamanı: ${esc(sourceTimeLabel(item.observedAt))}</span>` : ""}
      </button>
      <div class="result-links">${tel}<a href="${osm}" target="_blank" rel="noopener">Haritada aç</a></div>`;
    li.querySelector("button").addEventListener("click", () => {
      map.setView([item.lat, item.lng], 16);
      marker.openPopup();
    });
    els.list.appendChild(li);
  });

  if (!state.userLocation && bounds.length && bounds.length <= 100) {
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 13 });
  }
}
function renderSource() {
  if (!state.source) return;
  const when = state.retrievedAt ? new Date(state.retrievedAt).toLocaleString("tr-TR") : "—";
  els.source.innerHTML = `
    <strong>${esc(state.source.label)}</strong><br>
    ${esc(state.source.refreshNote)}<br>
    Son çekim: ${esc(when)} · <a href="${esc(state.source.dataset)}" target="_blank" rel="noopener">Resmî kaynak</a> · ${esc(state.source.license)}
  `;
}

async function loadData() {
  state.kind = els.kind.value;
  els.status.classList.remove("error");
  els.status.textContent = "Resmî kaynaktan veri alınıyor…";
  els.list.innerHTML = '<li class="empty">Yükleniyor…</li>';
  try {
    const response = await fetch(`/api/data?kind=${encodeURIComponent(state.kind)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || "Veri alınamadı");
    state.items = data.items;
    state.source = data.source;
    state.retrievedAt = data.retrievedAt;
    const hiddenNote = data.droppedCount > 0
      ? ` · ${data.droppedCount.toLocaleString("tr-TR")} konumsuz/uygunsuz kayıt haritada gösterilmedi`
      : "";
    els.status.textContent = `${data.count.toLocaleString("tr-TR")} kullanılabilir kayıt${hiddenNote} · ${data.source.transport === "csv-fallback" ? "resmî CSV failover" : "canlı API"}`;
    renderSource();
    render();
  } catch (error) {
    state.items = [];
    els.status.classList.add("error");
    els.status.textContent = "Kaynak şu anda erişilemiyor";
    els.list.innerHTML = `<li class="empty">Resmî veri kaynağına şu anda ulaşılamadı. “Hizmet yok” anlamına gelmez. Daha sonra tekrar deneyin.<br><small>${esc(error.message)}</small></li>`;
  }
}

async function getCurrentPosition() {
  if (!navigator.geolocation) throw new Error("Tarayıcınız konum özelliğini desteklemiyor.");
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => reject(new Error("Konum izni verilmedi veya konum alınamadı.")),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  });
}

async function loadLifeData() {
  const response = await fetch("/api/proximity");
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Yakınlık veri paketi alınamadı");
  }
  if (data.locationReceived !== false) {
    throw new Error("Gizlilik sözleşmesi doğrulanamadı");
  }
  return { byKind: data.byKind, meta: data.meta };
}

function radiusLabel(radiusMeters) {
  return radiusMeters >= 1000 ? `${radiusMeters / 1000} km` : `${radiusMeters} m`;
}

function renderLifeCard(summary) {
  state.lifeSummary = summary;
  const radius = radiusLabel(summary.radiusMeters);
  els.lifeTitle.textContent = `${radius} Yaşam Kartı`;

  const metrics = [
    ["duty_pharmacy", "Nöbetçi eczane"],
    ["pharmacy", "Eczane"],
    ["hospital", "Hastane"],
    ["market", "Semt pazarı"],
    ["assembly", "Afet alanı"]
  ];
  els.lifeCounts.innerHTML = metrics.map(([kind, label]) =>
    `<div class="metric"><strong>${summary.counts[kind]}</strong><span>${label}</span></div>`
  ).join("");

  const critical = ["duty_pharmacy", "hospital", "assembly"];
  els.lifeNearest.innerHTML = critical.map(kind => {
    const item = summary.nearest[kind];
    if (!item) {
      return `<div class="nearest-item"><span>En yakın ${KIND_LABELS[kind]}</span><strong>Kaynakta konumlu kayıt yok</strong></div>`;
    }
    return `<div class="nearest-item">
      <span>En yakın ${KIND_LABELS[kind]}</span>
      <strong>${esc(item.name)} · ${formatDistance(item.distanceKm)}</strong>
    </div>`;
  }).join("");

  const newest = Object.values(state.lifeData.meta)
    .map(meta => new Date(meta.retrievedAt).getTime())
    .filter(Number.isFinite)
    .sort((a, b) => b - a)[0];
  const checked = newest ? new Date(newest).toLocaleString("tr-TR") : new Date().toLocaleString("tr-TR");
  els.lifeEvidence.textContent = `5 resmî açık veri katmanı · Son veri çekimi: ${checked} · CC BY 4.0`;
  els.lifeStatus.textContent = `${radius} çevren için kart hazır. Koordinatın kartta ve paylaşım metninde yer almıyor.`;
  els.shareCard.disabled = false;
  els.downloadCard.disabled = false;
}

async function createLifeCard() {
  els.lifeButton.disabled = true;
  els.lifeButton.textContent = "Hazırlanıyor…";
  els.lifeStatus.textContent = "Konum cihazdan alınıyor ve beş resmî veri katmanı karşılaştırılıyor…";
  try {
    const origin = await getCurrentPosition();
    state.userLocation = origin;
    if (!state.lifeData) state.lifeData = await loadLifeData();
    const summary = summarizeProximity(state.lifeData.byKind, origin, state.lifeRadius);
    renderLifeCard(summary);

    if (userMarker) map.removeLayer(userMarker);
    userMarker = L.circleMarker([origin.lat, origin.lng], {
      radius: 9, weight: 3, color: "#004b3b", fillColor: "#ffffff", fillOpacity: 1
    }).addTo(map).bindPopup("Yaklaşık konumunuz");
    map.setView([origin.lat, origin.lng], 13);
    render();
  } catch (error) {
    els.lifeStatus.textContent = error.message || "Yaşam kartı oluşturulamadı.";
  } finally {
    els.lifeButton.disabled = false;
    els.lifeButton.textContent = "Yaşam kartımı oluştur";
  }
}

function buildLifeCardCanvas(summary) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext("2d");
  const radius = radiusLabel(summary.radiusMeters);

  ctx.fillStyle = "#073f32";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(255,255,255,.05)";
  ctx.beginPath();
  ctx.arc(1100, 40, 300, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#b8f1da";
  ctx.font = "700 28px system-ui";
  ctx.fillText("İZMİR YAKINIMDA", 64, 72);

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 58px system-ui";
  ctx.fillText(`${radius} Yaşam Kartım`, 64, 142);

  const metrics = [
    ["duty_pharmacy", "Nöbetçi eczane"],
    ["pharmacy", "Eczane"],
    ["hospital", "Hastane"],
    ["market", "Semt pazarı"],
    ["assembly", "Afet alanı"]
  ];

  const startX = 64;
  const gap = 14;
  const boxW = 202;
  metrics.forEach(([kind, label], index) => {
    const x = startX + index * (boxW + gap);
    ctx.fillStyle = "rgba(255,255,255,.10)";
    ctx.fillRect(x, 190, boxW, 150);
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 52px system-ui";
    ctx.fillText(String(summary.counts[kind]), x + 18, 250);
    ctx.fillStyle = "rgba(255,255,255,.78)";
    ctx.font = "600 22px system-ui";
    ctx.fillText(label, x + 18, 300);
  });

  ctx.fillStyle = "#b8f1da";
  ctx.font = "700 22px system-ui";
  ctx.fillText("EN YAKIN KRİTİK HİZMETLER", 64, 392);

  const critical = [
    ["duty_pharmacy", 64],
    ["hospital", 430],
    ["assembly", 796]
  ];
  critical.forEach(([kind, x]) => {
    const item = summary.nearest[kind];
    ctx.fillStyle = "rgba(0,0,0,.14)";
    ctx.fillRect(x, 416, 340, 100);
    ctx.fillStyle = "rgba(255,255,255,.70)";
    ctx.font = "600 18px system-ui";
    ctx.fillText(`En yakın ${KIND_LABELS[kind]}`, x + 16, 448);
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 21px system-ui";
    const label = item ? `${item.name.slice(0, 22)} · ${formatDistance(item.distanceKm)}` : "Kayıt yok";
    ctx.fillText(label, x + 16, 484);
  });

  ctx.fillStyle = "rgba(255,255,255,.72)";
  ctx.font = "500 18px system-ui";
  ctx.fillText("Kaynak: İzmir Büyükşehir Belediyesi Açık Veri Portalı · CC BY 4.0", 64, 572);
  ctx.fillText("Koordinat ve açık adres bu kartta yer almaz. #İzmirYakınımda", 64, 604);
  return canvas;
}

function canvasBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("PNG üretilemedi")), "image/png", 0.92);
  });
}

async function shareLifeCard() {
  if (!state.lifeSummary) return;
  const text = shareText(state.lifeSummary);
  const canvas = buildLifeCardCanvas(state.lifeSummary);
  try {
    const blob = await canvasBlob(canvas);
    const file = new File([blob], "izmir-yakinimda.png", { type: "image/png" });
    if (navigator.share) {
      const payload = { title: "İzmir Yakınımda", text, url: location.href };
      if (navigator.canShare?.({ files: [file] })) payload.files = [file];
      await navigator.share(payload);
      els.lifeStatus.textContent = "Yaşam kartı paylaşım ekranına gönderildi.";
      return;
    }
    await navigator.clipboard.writeText(`${text} ${location.href}`);
    els.lifeStatus.textContent = "Paylaşım metni panoya kopyalandı.";
  } catch (error) {
    if (error?.name !== "AbortError") {
      els.lifeStatus.textContent = "Paylaşım açılamadı; PNG indir seçeneğini kullanabilirsin.";
    }
  }
}

function downloadLifeCard() {
  if (!state.lifeSummary) return;
  const canvas = buildLifeCardCanvas(state.lifeSummary);
  const link = document.createElement("a");
  link.download = `izmir-yakinimda-${state.lifeSummary.radiusMeters}m.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
  els.lifeStatus.textContent = "Yaşam kartı PNG olarak indirildi.";
}

function updateLifeRadius(radiusMeters) {
  state.lifeRadius = radiusMeters;
  els.radiusButtons.forEach(button => {
    const selected = Number(button.dataset.radius) === radiusMeters;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  if (state.lifeData && state.userLocation) {
    renderLifeCard(summarizeProximity(state.lifeData.byKind, state.userLocation, radiusMeters));
  } else {
    els.lifeTitle.textContent = `${radiusLabel(radiusMeters)} Yaşam Kartı`;
  }
}

function useLocation() {
  if (!navigator.geolocation) {
    els.status.classList.add("error");
    els.status.textContent = "Tarayıcınız konum özelliğini desteklemiyor";
    return;
  }
  els.locate.disabled = true;
  els.locate.textContent = "Konum alınıyor…";
  navigator.geolocation.getCurrentPosition(
    pos => {
      state.userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      if (userMarker) map.removeLayer(userMarker);
      userMarker = L.circleMarker([state.userLocation.lat, state.userLocation.lng], {
        radius: 9, weight: 3, color: "#004b3b", fillColor: "#ffffff", fillOpacity: 1
      }).addTo(map).bindPopup("Yaklaşık konumunuz");
      map.setView([state.userLocation.lat, state.userLocation.lng], 13);
      els.locate.disabled = false;
      els.locate.textContent = "Konumuma göre sırala";
      render();
    },
    () => {
      els.locate.disabled = false;
      els.locate.textContent = "Konumuma göre sırala";
      els.status.classList.add("error");
      els.status.textContent = "Konum izni verilmedi; hizmetleri yine listeleyebilirsiniz";
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
  );
}

els.kind.addEventListener("change", loadData);
els.search.addEventListener("input", render);
els.limit.addEventListener("change", render);
els.locate.addEventListener("click", useLocation);
els.lifeButton.addEventListener("click", createLifeCard);
els.shareCard.addEventListener("click", shareLifeCard);
els.downloadCard.addEventListener("click", downloadLifeCard);
els.radiusButtons.forEach(button => {
  button.addEventListener("click", () => updateLifeRadius(Number(button.dataset.radius)));
});
updateLifeRadius(1000);
loadData();