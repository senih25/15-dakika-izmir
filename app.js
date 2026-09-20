const state = {
  kind: "duty_pharmacy",
  items: [],
  userLocation: null,
  source: null,
  retrievedAt: null
};

const els = {
  kind: document.querySelector("#kindSelect"),
  search: document.querySelector("#searchInput"),
  limit: document.querySelector("#limitSelect"),
  locate: document.querySelector("#locateBtn"),
  status: document.querySelector("#liveStatus"),
  list: document.querySelector("#resultsList"),
  source: document.querySelector("#sourceSummary")
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

function haversine(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
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
      distanceKm: state.userLocation ? haversine(state.userLocation, item) : null
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
loadData();