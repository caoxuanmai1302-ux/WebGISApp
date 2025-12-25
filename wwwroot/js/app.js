// ================== TILE URLS ==================
const tileUrl = {
  "2019": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/e7a5128e8942e2b0d30fedf54efd5dc1-ab40bb5541630556948daeaa3b5b132a/tiles/{z}/{x}/{y}",
  "2020": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/1a291f251688cb7465e065c8d3ce3c93-1cda17bbc00e948e428cb156adf6cf7c/tiles/{z}/{x}/{y}",
  "2021": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/95d21c5fe60806142737b74a72eb711e-eba43f1b31f606e51ef04d73ba6c0f4c/tiles/{z}/{x}/{y}",
  "2022": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/e17c12d0a4615491464b72fd2e7ba6fa-abd0f0dc98e2e0a58b7b2fafe729c769/tiles/{z}/{x}/{y}",
  "2023": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/43c896ad477dad7ac4ad2ea8b46123d8-cb948fac76b4922917d0e3a37f83be07/tiles/{z}/{x}/{y}",
  "2024": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/8cc5be851a6ef74844fe4907c888012a-9b918c5b8795714cc8dec2bb7c39c71e/tiles/{z}/{x}/{y}",
  "2025": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/9fed23b84d46cbc3add1326c7d95b798-82241ebbf16ae661f90ebaf8d6391758/tiles/{z}/{x}/{y}"
};

const tileUrlGreen = {
  "2019": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/3cfbb491753d50e20ef154a9dfcd7291-a44cb4dde7e49c85338ec5ac0d93a5ef/tiles/{z}/{x}/{y}",
  "2020": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/48e3318c6feb6cf253e4f129ba2831e6-81dd8154ae28ce7a2ce09fae4d27ca66/tiles/{z}/{x}/{y}",
  "2021": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/20344b5d14a3fcc99390a624d86a3080-e0f552a4bdeaf99047789fd23b61ec6a/tiles/{z}/{x}/{y}",
  "2022": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/46c5d54e79f5a2a1215ebf34fa449ead-a68e947943b2292d202b7556405f37b4/tiles/{z}/{x}/{y}",
  "2023": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/9b109fb7bd15dca2a30a0e73fcdfd7f6-45ff03a96bd874a71eca452890613b22/tiles/{z}/{x}/{y}",
  "2024": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/e33202596c4e4088acef4b7764b2b9c9-13e5762fa61ae5bb76355d4ab56c0621/tiles/{z}/{x}/{y}",
  "2025": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/22d7249ad0b793b299212c33b5722b8b-5f31df865297cd28bc931e1bf5434f8d/tiles/{z}/{x}/{y}"
};

const tileUrlDiff = {
  "2019_2025": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/7cb13909ecbff0050f7084d2baa1005b-cd75ed391dbdd66224ccc528a0be1ee6/tiles/{z}/{x}/{y}"
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
