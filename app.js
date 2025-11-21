// NDVI Tile URLs (Mai cung cấp)
const tileUrl = {
    "2019": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/d86b7abc5a0f6d627e9319737fafc41e-1353aa6d5be8825fb66bb21003e4a220/tiles/{z}/{x}/{y}",
    "2020": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/621ac58fc80c258a9d146fbdd3839e04-126f7968c1aac141a26470ac019017bb/tiles/{z}/{x}/{y}",
    "2021": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/cdfb26dc0063b9c8cba8f80f1eefacfe-093a0daa92735c9401c82c9fff44f2da/tiles/{z}/{x}/{y}",
    "2022": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/de552719606604aba0e6dc86debc0d01-acdf441fa4e4feb5454dca99d89c617f/tiles/{z}/{x}/{y}",
    "2023": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/fe91851156364e9304b4c95c8471a45e-04dcf65190e1046a763236f555ea003a/tiles/{z}/{x}/{y}",
    "2024": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/a731efd281d8676a26a1e1f14f97635d-c84fe9bd0b1821340e036d032eed8296/tiles/{z}/{x}/{y}",
    "2025": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/352d9395a9c82864f0b8dbf61a904b57-8ddf0bef60173e202a343a19f3486a9c/tiles/{z}/{x}/{y}"
};

// MAP
var map = L.map("map").setView([11.0, 106.5], 11);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

// Layers
let boundaryLayer = null;
let ndviLayer = null;

// Load GeoJSON
fetch("data/green.json")
    .then(res => res.json())
    .then(json => initWebGIS(json));

// INIT
function initWebGIS(data) {
    const years = data.features.map(f => f.properties.year);

    // Fill selects
    let ySel = document.getElementById("yearSelect");
    let yA = document.getElementById("yearA");
    let yB = document.getElementById("yearB");

    years.forEach(y => {
        ySel.innerHTML += `<option>${y}</option>`;
        yA.innerHTML += `<option>${y}</option>`;
        yB.innerHTML += `<option>${y}</option>`;
    });

    // Chart
    drawChart(data);

    // Load initial
    updateYear(data, years[0]);

    ySel.onchange = () => updateYear(data, ySel.value);
}

// UPDATE YEAR
function updateYear(data, year) {
    let f = data.features.find(x => x.properties.year == year);

    // Boundary
    if (boundaryLayer) map.removeLayer(boundaryLayer);
    boundaryLayer = L.geoJSON(f.geometry, {
        style: { color: "red", weight: 3 }
    }).addTo(map);
    map.fitBounds(boundaryLayer.getBounds());

    // NDVI
    if (ndviLayer) map.removeLayer(ndviLayer);
    ndviLayer = L.tileLayer(tileUrl[year], { opacity: 0.65 }).addTo(map);

    // Mini stats
    document.getElementById("areaValue").textContent = f.properties.green_area_km2.toFixed(2) + " km²";
    document.getElementById("ratioValue").textContent = (f.properties.green_ratio * 100).toFixed(1) + "%";
    document.getElementById("monthValue").textContent = f.properties.last_data_month;
}

// CHART
function drawChart(data) {
    let years = data.features.map(f => f.properties.year);
    let areas = data.features.map(f => f.properties.green_area_km2);

    new Chart(document.getElementById("chart"), {
        type: "line",
        data: {
            labels: years,
            datasets: [{
                label: "Diện tích xanh (km²)",
                data: areas,
                borderColor: "#ff4f95",
                backgroundColor: "#ffb8d9",
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        }
    });
}
