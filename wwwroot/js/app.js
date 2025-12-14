// ================== TILE URLS ==================
const tileUrl = {
  "2019": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/2712db74b125ba90a3ba64d793f62902-e5e2dee88801cb1046647ac3cc1281ad/tiles/{z}/{x}/{y}",
  "2020": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/50e18a01e7a42dfb1b1283fa0f47921d-576746511c9c1f9e9b9911f5cc5f51b1/tiles/{z}/{x}/{y}",
  "2021": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/45d30a79d30afcfc142446410ab0e108-41276e9d36724dd0f3d89a9ee748d659/tiles/{z}/{x}/{y}",
  "2022": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/fea88086fdb3cbfef455c63c240d1e2e-ddcb0fcd0674775f3ce4c0b09f1edc2f/tiles/{z}/{x}/{y}",
  "2023": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/085f9bee1e55e888f32b05725b01f734-77878ab46d2812267c75ec12490fed9a/tiles/{z}/{x}/{y}",
  "2024": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/183b45a1e6732e7ebb4866da6c9b97c4-6711af69632a587c4a353ee8da6c5e48/tiles/{z}/{x}/{y}",
  "2025": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/db49a77e66f9e7e3e85614b09dcc9ca7-180f06761db713e0e42be7f8803e7520/tiles/{z}/{x}/{y}"
};

const tileUrlGreen = {
  "2019": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/df89965b827399cd38a9777fd8bc9a54-4c2b31e0f02658ea6f58dc52f2515dc8/tiles/{z}/{x}/{y}",
  "2020": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/7a9f815384602080a6a1143ab873a617-c2ac165c615024122176d9b8eae35bb7/tiles/{z}/{x}/{y}",
  "2021": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/a65c16be083e7924e2b8f182ba4b1648-119ee5407c79a0543ca6170497c5b21b/tiles/{z}/{x}/{y}",
  "2022": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/55828b5d3078fb9eb61112f1a7cc01b6-11f5c7f02a1f0bd4f0053e40b24d540d/tiles/{z}/{x}/{y}",
  "2023": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/5f21c8b4702470a5495a4d3b32b7d70c-43dfc7bc3d238219c0d60aad52a9305d/tiles/{z}/{x}/{y}",
  "2024": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/218fd05b506c4760acb6876ceca219b5-b97c5dbd70480e64126701428676f433/tiles/{z}/{x}/{y}",
  "2025": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/dbdf3b55733d2c1861c1bf9eab05918e-02e40966f39e9dcf59c62e990fb9364e/tiles/{z}/{x}/{y}"
};

const tileUrlDiff = {
  "2019_2025": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/ad073ad1db5b8dc7f16074c8b549f1c5-a1bae607a566aa642eec4f85aaa3ab85/tiles/{z}/{x}/{y}"
};

// ================== MODE ==================
let currentMode = "ndvi"; // ndvi | green | diff | compare

// ================== DOM ==================
const $ = (id) => document.getElementById(id);

const elYear = $("yearSelect");
const elYearA = $("yearA");
const elYearB = $("yearB");
const elArea = $("areaValue");
const elRatio = $("ratioValue");
const elNote = $("noteText");
const elLegendNDVI = $("legendNDVI");
const elLegendDiff = $("legendDiff");
const elOpacityWrap = $("opacityCompare");
const elOpacitySlider = $("opacitySlider");
const elCbHuyen = $("cbHuyen");
const elCbXa = $("cbXa");
const elChartMetric = $("chartMetric");

const btnNdvi = $("btnNdvi");
const btnGreen = $("btnGreenmap");
const btnDiff = $("btnDiff");
const btnCompare = $("compareBtn");

// Loading overlay
function setLoading(on, text) {
  const loading = $("loading");
  if (!loading) return;
  if (text) {
    const t = loading.querySelector(".loading-text");
    if (t) t.textContent = text;
  }
  loading.classList.toggle("hidden", !on);
}

// ================== MAP ==================
const map = L.map("map", { zoomControl: true }).setView([11.0, 106.5], 11);
window.__leafletMap = map;

map.createPane("base");    map.getPane("base").style.zIndex = 100;
map.createPane("raster");  map.getPane("raster").style.zIndex = 200;
map.createPane("overlay"); map.getPane("overlay").style.zIndex = 400;

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  pane: "base"
}).addTo(map);

let rasterLayer = null;
let compareLayerA = null;
let compareLayerB = null;

// ================== BORDER LAYERS ==================
let huyenLayer = null;
let xaLayer = null;
let selectedXaName = null;
let selectedXaLeafletLayer = null;

// ================== DATA CACHE ==================
let greenDataCache = null; // green.json
let xaStatsIndex = null;   // {xaName: {year: {...}}}
let xaDiffIndex = null;    // {xaName: {...}}
let yearsCache = null;

// ================== NOTES ==================
const ndviNotes = {
  2019: "Năm 2019, NDVI duy trì mức trung bình–khá. Thảm thực vật ổn định, phân bố đều tại các khu vực nông nghiệp và sinh thái truyền thống.",
  2020: "Năm 2020 có NDVI thấp nhất do thời tiết khô hạn đầu năm và biến động mùa vụ. Đại dịch Covid cũng khiến canh tác bị gián đoạn.",
  2021: "NDVI phục hồi mạnh trong 2021 nhờ giãn cách xã hội làm giảm áp lực môi trường, cây trồng phục hồi tốt hơn.",
  2022: "2022 là năm xanh nhất, điều kiện khí hậu thuận lợi giúp NDVI đạt mức cao nhất trong toàn bộ chuỗi dữ liệu.",
  2023: "NDVI giảm nhẹ trong 2023 do mở rộng đô thị – công nghiệp, nhưng tổng thể vẫn ổn định.",
  2024: "Năm 2024 NDVI giảm nhẹ, một phần do xây dựng hạ tầng và biến động thời tiết theo mùa.",
  2025: "NDVI tăng trở lại vào 2025, tuy nhiên kết quả chỉ mang tính tạm thời do dữ liệu hiện tại mới bao phủ đến tháng 11. Cần dữ liệu trọn năm để kết luận chắc chắn hơn."
};

const greenNotes = {
  2019: "Mảng xanh 2019 phân bố liên tục và rộng, phản ánh giai đoạn ổn định của sản xuất nông nghiệp. Các vùng trồng trọt truyền thống duy trì mật độ xanh cao và ít bị phân mảnh.",

  2020: "GreenMap 2020 giảm mạnh do tác động của thời tiết bất thường và hạn mặn ở một số khu vực.",

  2021: "Diện tích xanh 2021 bắt đầu phục hồi sau giai đoạn biến động. Một số vùng nông nghiệp mở rộng diện tích canh tác, góp phần nâng tỷ lệ xanh toàn huyện.",

  2022: "GreenMap 2022 tăng mạnh rõ rệt, đạt mức cao nhất trong giai đoạn 2019–2025. Nhiều khu vực xanh hóa trở lại nhờ thời tiết thuận lợi và hoạt động sản xuất hồi phục hoàn toàn sau đại dịch.",

  2023: "Năm 2023 có mức giảm diện tích xanh, chủ yếu do chuyển đổi đất và mở rộng hạ tầng ở một số xã. Tuy nhiên độ bao phủ xanh tổng thể vẫn duy trì ở mức tốt.",

  2024: "Mảng xanh 2024 tiếp tục suy giảm nhẹ do đô thị hóa và xây dựng hạ tầng. Mặc dù vậy, các vùng nông nghiệp trọng điểm vẫn giữ được diện tích xanh tương đối ổn định.",

  2025: "Dữ liệu 2025 chỉ tính đến tháng 11 nên chưa phản ánh toàn bộ năm. Mảng xanh phục hồi trở lại so với 2023–2024, nhiều khu vực trồng cây ăn trái và đất nông nghiệp đạt NDVI cao hơn vào mùa mưa.",
};


const diffNotes = {
  diff: "Giai đoạn 2019–2025: có nơi giảm do đô thị hóa/hạ tầng, và có vùng tăng do phục hồi tự nhiên – trồng cây."
};

// ================== UI HELPERS ==================
function hideLegends() {
  if (elLegendNDVI) elLegendNDVI.style.display = "none";
  if (elLegendDiff) elLegendDiff.style.display = "none";
}

function setActiveButtons() {
  const all = [btnNdvi, btnGreen, btnDiff];
  all.forEach(b => b && b.classList.remove("is-active"));
  if (currentMode === "ndvi") btnNdvi?.classList.add("is-active");
  if (currentMode === "green") btnGreen?.classList.add("is-active");
  if (currentMode === "diff") btnDiff?.classList.add("is-active");
}

function updateNote(key) {
  if (!elNote) return;
  const xaPrefix = selectedXaName ? `Đang chọn xã: ${selectedXaName}\n\n` : "";

  let text = "";
  if (currentMode === "ndvi") text = ndviNotes[key] || "Chưa có đánh giá cho năm này.";
  else if (currentMode === "green") text = greenNotes[key] || "Chưa có đánh giá cho năm này.";
  else if (currentMode === "diff") text = diffNotes.diff;
  else text = "Đang so sánh — không hiển thị đánh giá.";

  elNote.textContent = xaPrefix + text;
}

function clearRaster() {
  if (rasterLayer) map.removeLayer(rasterLayer);
  if (compareLayerA) map.removeLayer(compareLayerA);
  if (compareLayerB) map.removeLayer(compareLayerB);
  rasterLayer = compareLayerA = compareLayerB = null;
}

function attachTileError(layer) {
  if (!layer) return;
  layer.on("tileerror", () => {
    if (!layer.__eeWarned) {
      layer.__eeWarned = true;
      alert("Tile Earth Engine bị lỗi / hết hạn. Bạn cần lấy tile URL mới từ GEE rồi cập nhật lại.");
    }
  });
}

function addSingleTile(urlTemplate) {
  clearRaster();
  rasterLayer = L.tileLayer(urlTemplate, { pane: "raster", opacity: 1, maxZoom: 19 });
  attachTileError(rasterLayer);
  rasterLayer.addTo(map);
}

function setCompareTiles(urlA, urlB) {
  clearRaster();
  compareLayerA = L.tileLayer(urlA, { pane: "raster", opacity: 1, maxZoom: 19 }).addTo(map);
  compareLayerB = L.tileLayer(urlB, { pane: "raster", opacity: 0.5, maxZoom: 19 }).addTo(map);
  attachTileError(compareLayerA);
  attachTileError(compareLayerB);
}

// ================== STATS ==================
function setStats(areaKm2, ratioPercent) {
  if (elArea) elArea.textContent = (areaKm2 == null ? "-- km²" : areaKm2.toFixed(2) + " km²");
  if (elRatio) elRatio.textContent = (ratioPercent == null ? "-- %" : ratioPercent.toFixed(1) + "%");
}

function updateStatsForSelected(year) {
  // ưu tiên xã nếu đang chọn
  if (selectedXaName && xaStatsIndex?.[selectedXaName]) {
    const s = xaStatsIndex[selectedXaName][Number(year)];
    if (s) {
      setStats(s.green_km2, (s.green_ratio ?? 0) * 100);
      return;
    }
  }

  // fallback huyện
  const f = greenDataCache?.features?.find(x => Number(x.properties?.year) === Number(year));
  if (f) setStats(f.properties.green_area_km2, (f.properties.green_ratio ?? 0) * 100);
  else setStats(null, null);
}

// ================== RENDER MAP ==================
function renderByModeYear(year) {
  hideLegends();
  setActiveButtons();
  if (elOpacityWrap) elOpacityWrap.style.display = "none";

  if (currentMode === "ndvi") {
    addSingleTile(tileUrl[String(year)]);
    if (elLegendNDVI) elLegendNDVI.style.display = "block";
    updateNote(Number(year));
    updateStatsForSelected(year);
    return;
  }

  if (currentMode === "green") {
    addSingleTile(tileUrlGreen[String(year)]);
    updateNote(Number(year));
    updateStatsForSelected(year);
    return;
  }

  if (currentMode === "diff") {
    addSingleTile(tileUrlDiff["2019_2025"]);
    if (elLegendDiff) elLegendDiff.style.display = "block";
    updateNote("diff");

    // show stats theo 2025 nếu có
    if (selectedXaName && xaStatsIndex?.[selectedXaName]) {
      const b = xaStatsIndex[selectedXaName][2025];
      if (b) setStats(b.green_km2, (b.green_ratio ?? 0) * 100);
    }
    return;
  }

  updateNote("compare");
}

// ================== GEOJSON LOAD ==================
async function tryLoadGeoJson(url) {
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

const normXa = (s) => (s ?? "").toString().trim().replace(/\s+/g, " ");

function getXaNameFromProps(p) {
  const raw = p?.XA_MOI || p?.xa || p?.name || p?.NAME || p?.ADM3_NAME || "";
  const v = normXa(raw);
  return v || "CHUA_GAN";
}

function pickNum(p, keys) {
  for (const k of keys) {
    const v = p?.[k];
    if (v !== undefined && v !== null && v !== "") return Number(v);
  }
  return null;
}

// ================== LOAD BORDERS ==================
async function loadBorders() {
  const huyenGeo = await tryLoadGeoJson("/data/huyen.geojson");
  const xaGeo = await tryLoadGeoJson("/data/xa.geojson");

  console.log("huyen.geojson loaded:", !!huyenGeo);
  console.log("xa.geojson loaded:", !!xaGeo);

  if (huyenGeo) {
    huyenLayer = L.geoJSON(huyenGeo, {
      pane: "overlay",
      style: { color: "#ff2d2d", weight: 2.2, fillOpacity: 0 },
      interactive: false
    }).addTo(map);

    // nếu checkbox đang tắt thì remove
    if (elCbHuyen && !elCbHuyen.checked) map.removeLayer(huyenLayer);
  }

  if (xaGeo) {
    xaLayer = L.geoJSON(xaGeo, {
      pane: "overlay",
      style: { color: "#2a7cff", weight: 1.2, fillOpacity: 0 },
      interactive: true,
      onEachFeature: (feature, layer) => {
        const xaName = getXaNameFromProps(feature.properties);
        if (xaName && xaName !== "CHUA_GAN") {
          layer.bindTooltip(xaName, { sticky: true, direction: "top" });
        }

        layer.on("click", () => {
          const name = getXaNameFromProps(feature.properties);
          if (!name || name === "CHUA_GAN") return;

          // reset highlight cũ
          if (selectedXaLeafletLayer && xaLayer) xaLayer.resetStyle(selectedXaLeafletLayer);

          selectedXaLeafletLayer = layer;
          selectedXaName = name;

          layer.setStyle({ color: "#ffd400", weight: 3 });

          const year = Number(elYear?.value || 2019);
          updateStatsForSelected(year);
          updateNote(currentMode === "diff" ? "diff" : year);

          // cập nhật biểu đồ theo xã
          renderChart();
        });
      }
    }).addTo(map);

    if (elCbXa && !elCbXa.checked) map.removeLayer(xaLayer);
  }

  // checkbox toggle
  elCbHuyen?.addEventListener("change", (e) => {
    if (!huyenLayer) return;
    e.target.checked ? huyenLayer.addTo(map) : map.removeLayer(huyenLayer);
  });

  elCbXa?.addEventListener("change", (e) => {
    if (!xaLayer) return;
    e.target.checked ? xaLayer.addTo(map) : map.removeLayer(xaLayer);
  });
}

// ================== LOAD XA STATS + DIFF ==================
async function loadXaStats() {
  const geo =
    (await tryLoadGeoJson("/data/xa_stats.geojson")) ||
    (await tryLoadGeoJson("/data/xa_stats.json"));

  if (!geo?.features?.length) {
    console.warn("Không thấy xa_stats => thiếu NDVI theo xã.");
    xaStatsIndex = null;
    return;
  }

  const idx = {};
  for (const f of geo.features) {
    const p = f.properties || {};
    const xaName = getXaNameFromProps(p);
    const year = Number(p.year ?? p.YEAR);
    if (!xaName || xaName === "CHUA_GAN" || !year) continue;

    idx[xaName] ||= {};
    idx[xaName][year] = {
      ndvi_mean: pickNum(p, ["ndvi_mean", "NDVI_mean", "mean_ndvi", "ndviMean"]),
      ndvi_min:  pickNum(p, ["ndvi_min",  "NDVI_min",  "min_ndvi",  "ndviMin"]),
      ndvi_max:  pickNum(p, ["ndvi_max",  "NDVI_max",  "max_ndvi",  "ndviMax"]),
      green_km2: pickNum(p, ["green_km2", "green_area_km2", "greenKm2"]),
      green_ratio: pickNum(p, ["green_ratio", "greenRatio"]),
      area_km2: pickNum(p, ["area_km2", "Area_km2"])
    };
  }

  xaStatsIndex = idx;
  console.log("xa_stats loaded. so xa =", Object.keys(xaStatsIndex).length);
}

async function loadXaDiff() {
  const geo =
    (await tryLoadGeoJson("/data/xa_diff.geojson")) ||
    (await tryLoadGeoJson("/data/xa_diff.json"));

  if (!geo?.features?.length) {
    console.warn("Không thấy xa_diff => sẽ fallback tự tính diff từ xa_stats (2025-2019).");
    xaDiffIndex = null;
    return;
  }

  const idx = {};
  for (const f of geo.features) {
    const p = f.properties || {};
    const xaName = getXaNameFromProps(p);
    if (!xaName || xaName === "CHUA_GAN") continue;

    idx[xaName] = {
      diff_ndvi_mean: pickNum(p, ["diff_ndvi_mean", "d_ndvi", "delta_ndvi_mean"]),
      diff_green_km2: pickNum(p, ["diff_green_km2", "d_green_km2", "delta_green_km2"]),
      diff_green_ratio: pickNum(p, ["diff_green_ratio", "d_green_ratio", "delta_green_ratio"])
    };
  }

  xaDiffIndex = idx;
  console.log("xa_diff loaded. so xa =", Object.keys(xaDiffIndex).length);
}

// ================== YEAR SELECTS ==================
function fillYearSelects(years) {
  yearsCache = years;

  if (elYear) elYear.innerHTML = "";
  if (elYearA) elYearA.innerHTML = "";
  if (elYearB) elYearB.innerHTML = "";

  years.forEach(y => {
    elYear && (elYear.innerHTML += `<option value="${y}">${y}</option>`);
    elYearA && (elYearA.innerHTML += `<option value="${y}">${y}</option>`);
    elYearB && (elYearB.innerHTML += `<option value="${y}">${y}</option>`);
  });

  if (elYear) elYear.value = years[0];
  if (elYearA) elYearA.value = years[0];
  if (elYearB) elYearB.value = years[years.length - 1];
}

// ================== CHART ==================
let chartInstance = null;

function drawChart({ type, labels, datasets, title, beginAtZero = false }) {
  const canvas = $("chart");
  if (!canvas) return;

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(canvas, {
    type,
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        title: { display: !!title, text: title }
      },
      scales: {
        y: { beginAtZero }
      }
    }
  });
}

function drawNoData(title, msg) {
  drawChart({
    type: "bar",
    labels: [msg],
    title,
    datasets: [{ label: "N/A", data: [0] }],
    beginAtZero: true
  });
}

function renderChart() {
  const metric = elChartMetric?.value || "green_km2";
  const years = yearsCache || [];

  // ====== CASE: ĐANG CHỌN XÃ ======
  if (selectedXaName && xaStatsIndex?.[selectedXaName]) {
    const byYear = xaStatsIndex[selectedXaName];

    // 1) NDVI mean
    if (metric === "ndvi_mean") {
      const series = years.map(y => byYear[y]?.ndvi_mean ?? null);
      if (!series.some(v => v != null)) {
        return drawNoData(`NDVI trung bình – ${selectedXaName}`, "Thiếu ndvi_mean trong xa_stats");
      }
      return drawChart({
        type: "line",
        labels: years,
        title: `NDVI trung bình – ${selectedXaName}`,
        datasets: [{ label: "NDVI mean", data: series, borderWidth: 3, tension: 0.35, fill: true }]
      });
    }

    // 2) NDVI min/max
    if (metric === "ndvi_minmax") {
      const minS = years.map(y => byYear[y]?.ndvi_min ?? null);
      const maxS = years.map(y => byYear[y]?.ndvi_max ?? null);
      if (!minS.some(v => v != null) && !maxS.some(v => v != null)) {
        return drawNoData(`NDVI min/max – ${selectedXaName}`, "Thiếu ndvi_min/ndvi_max trong xa_stats");
      }
      return drawChart({
        type: "line",
        labels: years,
        title: `NDVI min/max – ${selectedXaName}`,
        datasets: [
          { label: "NDVI min", data: minS, borderWidth: 2, tension: 0.35 },
          { label: "NDVI max", data: maxS, borderWidth: 2, tension: 0.35 }
        ]
      });
    }

    // 3) DIFF NDVI 2019→2025 (bar)
    if (metric === "diff_mean") {
      let d = xaDiffIndex?.[selectedXaName]?.diff_ndvi_mean;

      // fallback tự tính từ xa_stats nếu thiếu xa_diff
      if (d == null) {
        const a = byYear[2019]?.ndvi_mean;
        const b = byYear[2025]?.ndvi_mean;
        if (a != null && b != null) d = b - a;
      }

      if (d == null) {
        return drawNoData(`Biến động NDVI – ${selectedXaName}`, "Thiếu xa_diff hoặc thiếu NDVI 2019/2025");
      }

      return drawChart({
        type: "bar",
        labels: ["2019→2025"],
        title: `Biến động NDVI – ${selectedXaName}`,
        datasets: [{ label: "Δ NDVI", data: [d], borderWidth: 1 }],
        beginAtZero: true
      });
    }

    // 4) GREEN (km2 / ratio)
    if (metric === "green_ratio") {
      const series = years.map(y => byYear[y]?.green_ratio ?? null);
      if (!series.some(v => v != null)) {
        return drawNoData(`Tỷ lệ xanh – ${selectedXaName}`, "Thiếu green_ratio trong xa_stats");
      }
      return drawChart({
        type: "line",
        labels: years,
        title: `Tỷ lệ xanh (%) – ${selectedXaName}`,
        datasets: [{ label: "%", data: series.map(v => v == null ? null : v * 100), borderWidth: 3, tension: 0.35, fill: true }],
        beginAtZero: true
      });
    }

    // green_km2 default
    if (metric === "green_km2") {
      const series = years.map(y => byYear[y]?.green_km2 ?? null);
      if (!series.some(v => v != null)) {
        return drawNoData(`Diện tích xanh – ${selectedXaName}`, "Thiếu green_km2 trong xa_stats");
      }
      return drawChart({
        type: "line",
        labels: years,
        title: `Diện tích xanh (km²) – ${selectedXaName}`,
        datasets: [{ label: "km²", data: series, borderWidth: 3, tension: 0.35, fill: true }],
        beginAtZero: true
      });
    }
  }

  // ====== CASE: KHÔNG CHỌN XÃ (TOÀN HUYỆN) ======
  if (!greenDataCache?.features?.length) return drawNoData("Biểu đồ", "Chưa load green.json");

  const yrs = greenDataCache.features.map(f => Number(f.properties.year));

  if (metric === "green_km2") {
    const areas = greenDataCache.features.map(f => Number(f.properties.green_area_km2 ?? 0));
    return drawChart({
      type: "line",
      labels: yrs,
      title: "Diện tích xanh toàn huyện (km²)",
      datasets: [{ label: "km²", data: areas, borderWidth: 3, tension: 0.35, fill: true }],
      beginAtZero: true
    });
  }

  if (metric === "green_ratio") {
    const ratios = greenDataCache.features.map(f => Number(f.properties.green_ratio ?? 0) * 100);
    return drawChart({
      type: "line",
      labels: yrs,
      title: "Tỷ lệ xanh toàn huyện (%)",
      datasets: [{ label: "%", data: ratios, borderWidth: 3, tension: 0.35, fill: true }],
      beginAtZero: true
    });
  }

  if (metric === "ndvi_mean") {
    if (!xaStatsIndex || !years.length) {
      return drawNoData("NDVI trung bình toàn huyện", "Thiếu xa_stats (ndvi_mean)");
    }

    const vals = years.map(y => {
      let sumW = 0, sum = 0;
      for (const [xa, byYear] of Object.entries(xaStatsIndex)) {
        const item = byYear[y];
        if (!item || item.ndvi_mean == null) continue;
        const w = item.area_km2 ?? 1;
        sum += item.ndvi_mean * w;
        sumW += w;
      }
      return sumW ? (sum / sumW) : null;
    });

    if (!vals.some(v => v != null)) {
      return drawNoData("NDVI trung bình toàn huyện", "xa_stats không có ndvi_mean");
    }

    return drawChart({
      type: "line",
      labels: years,
      title: "NDVI trung bình toàn huyện (từ xã)",
      datasets: [{ label: "NDVI mean", data: vals, borderWidth: 3, tension: 0.35, fill: true }]
    });
  }

  if (metric === "ndvi_minmax") {
    if (!xaStatsIndex || !years.length) {
      return drawNoData("NDVI min/max toàn huyện", "Thiếu xa_stats (ndvi_min/max)");
    }

    const mins = years.map(y => {
      let v = null;
      for (const byYear of Object.values(xaStatsIndex)) {
        const x = byYear[y]?.ndvi_min;
        if (x == null) continue;
        v = (v == null) ? x : Math.min(v, x);
      }
      return v;
    });

    const maxs = years.map(y => {
      let v = null;
      for (const byYear of Object.values(xaStatsIndex)) {
        const x = byYear[y]?.ndvi_max;
        if (x == null) continue;
        v = (v == null) ? x : Math.max(v, x);
      }
      return v;
    });

    if (!mins.some(v => v != null) && !maxs.some(v => v != null)) {
      return drawNoData("NDVI min/max toàn huyện", "xa_stats không có ndvi_min/max");
    }

    return drawChart({
      type: "line",
      labels: years,
      title: "NDVI min/max toàn huyện (từ xã)",
      datasets: [
        { label: "NDVI min", data: mins, borderWidth: 2, tension: 0.35 },
        { label: "NDVI max", data: maxs, borderWidth: 2, tension: 0.35 }
      ]
    });
  }

  if (metric === "diff_mean") {
    // Top xã biến động NDVI 2019→2025
    let rows = [];

    if (xaDiffIndex) {
      rows = Object.entries(xaDiffIndex)
        .map(([name, v]) => ({ name, val: v.diff_ndvi_mean ?? 0 }))
        .sort((a, b) => b.val - a.val)
        .slice(0, 15);
    } else if (xaStatsIndex) {
      rows = Object.entries(xaStatsIndex)
        .map(([name, byYear]) => {
          const a = byYear[2019]?.ndvi_mean;
          const b = byYear[2025]?.ndvi_mean;
          const val = (a != null && b != null) ? (b - a) : null;
          return { name, val: val ?? 0, ok: val != null };
        })
        .filter(r => r.ok)
        .sort((a, b) => b.val - a.val)
        .slice(0, 15);
    }

    if (!rows.length) {
      return drawNoData("Top xã biến động NDVI", "Thiếu xa_diff hoặc thiếu NDVI 2019/2025");
    }

    return drawChart({
      type: "bar",
      labels: rows.map(r => r.name),
      title: "Top xã biến động NDVI (2019→2025)",
      datasets: [{ label: "Δ NDVI", data: rows.map(r => r.val), borderWidth: 1 }],
      beginAtZero: true
    });
  }

  // fallback
  drawNoData("Biểu đồ", "Chưa hỗ trợ loại này");
}

// ================== EVENTS ==================
btnNdvi?.addEventListener("click", () => {
  currentMode = "ndvi";
  renderByModeYear(Number(elYear?.value || 2019));
});

btnGreen?.addEventListener("click", () => {
  currentMode = "green";
  renderByModeYear(Number(elYear?.value || 2019));
});

btnDiff?.addEventListener("click", () => {
  currentMode = "diff";
  renderByModeYear(Number(elYear?.value || 2019));
});

btnCompare?.addEventListener("click", () => {
  const a = Number(elYearA?.value);
  const b = Number(elYearB?.value);
  if (!a || !b) return;
  if (a === b) return alert("Hãy chọn 2 năm khác nhau!");

  currentMode = "compare";
  hideLegends();
  setActiveButtons();
  clearRaster();

  setCompareTiles(tileUrl[String(a)], tileUrl[String(b)]);
  if (elOpacityWrap) elOpacityWrap.style.display = "block";
  if (elOpacitySlider) {
    elOpacitySlider.value = "0.5";
    elOpacitySlider.oninput = (e) => compareLayerB?.setOpacity(Number(e.target.value));
  }

  updateNote("compare");
});

elYear?.addEventListener("change", () => {
  const y = Number(elYear.value);
  if (currentMode !== "compare") renderByModeYear(y);
  else updateNote("compare");
  renderChart();
});

elChartMetric?.addEventListener("change", () => {
  renderChart();
});

// sidebar toggle
$("toggleBtn")?.addEventListener("click", () => {
  const sidebar = $("sidebar");
  if (!sidebar) return;

  sidebar.classList.toggle("collapsed");
  document.body.classList.toggle("panel-collapsed");
  setTimeout(() => map.invalidateSize(), 220);
});

// chart panel toggle
$("chartToggle")?.addEventListener("click", () => {
  const panel = $("chartPanel");
  if (!panel) return;

  panel.classList.toggle("chart-collapsed");
  setTimeout(() => map.invalidateSize(), 220);
});

// ================== BOOT ==================
(async function boot() {
  try {
    setLoading(true, "Đang tải dữ liệu...");

    // 1) load green.json
    const res = await fetch("/data/green.json", { cache: "no-store" });
    greenDataCache = await res.json();

    const years = [...new Set(greenDataCache.features.map(f => Number(f.properties.year)))]
      .filter(Boolean)
      .sort((a, b) => a - b);

    fillYearSelects(years);

    // 2) load stats theo xã + diff + borders
    await loadXaStats();
    await loadXaDiff();
    await loadBorders();

    // 3) render default
    currentMode = "ndvi";
    setActiveButtons();
    renderByModeYear(Number(elYear?.value || years[0] || 2019));

    // 4) render chart default
    renderChart();
  } catch (err) {
    console.error(err);
    alert("Lỗi tải dữ liệu. Kiểm tra /data/green.json và console.");
  } finally {
    setLoading(false);
    setTimeout(() => map.invalidateSize(), 250);
  }
})();
