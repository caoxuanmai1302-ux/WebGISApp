const tileUrl = {
    "2019": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/d86b7abc5a0f6d627e9319737fafc41e-1353aa6d5be8825fb66bb21003e4a220/tiles/{z}/{x}/{y}",
    "2020": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/621ac58fc80c258a9d146fbdd3839e04-126f7968c1aac141a26470ac019017bb/tiles/{z}/{x}/{y}",
    "2021": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/cdfb26dc0063b9c8cba8f80f1eefacfe-093a0daa92735c9401c82c9fff44f2da/tiles/{z}/{x}/{y}",
    "2022": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/de552719606604aba0e6dc86debc0d01-acdf441fa4e4feb5454dca99d89c617f/tiles/{z}/{x}/{y}",
    "2023": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/fe91851156364e9304b4c95c8471a45e-04dcf65190e1046a763236f555ea003a/tiles/{z}/{x}/{y}",
    "2024": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/a731efd281d8676a26a1e1f14f97635d-c84fe9bd0b1821340e036d032eed8296/tiles/{z}/{x}/{y}",
    "2025": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/352d9395a9c82864f0b8dbf61a904b57-8ddf0bef60173e202a343a19f3486a9c/tiles/{z}/{x}/{y}"
};

const tileUrlGreen = {
    "2019": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/bc375b647eaf47e794cd9a559b2c8730-4f1fca5f161e3d4bb89fd1cc7328a1e1/tiles/{z}/{x}/{y}",
    "2020": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/02a73025ebd0450af50bdd121689e5aa-3d70f91a1479bf1ab3cc1a7f63c745c9/tiles/{z}/{x}/{y}",
    "2021": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/7f47836139c2e3252d4764534cb2000a-8aa018ddbe0ecb2ce1e60d15a948baac/tiles/{z}/{x}/{y}",
    "2022": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/3a119e8368d8a2c930b333b9088b817e-d70685b3f7d006375fa896635d712a01/tiles/{z}/{x}/{y}",
    "2023": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/9c1cc29b451ffc39d8fbdd371ce079f2-8d489a0851cd427ed71f87b43cdab3b0/tiles/{z}/{x}/{y}",
    "2024": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/783b653ef9100a9d79cc51a007300fb8-dfdb5d64c6898d871e14be19b8151d99/tiles/{z}/{x}/{y}",
    "2025": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/9a4784e715a1d880cb33ce1bcc3c0d87-ce053f27f0e832681273ac714641c3d1/tiles/{z}/{x}/{y}"
};

const tileUrlDiff = {
    "2019_2025": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/d2abb456448e8218c2c6683740676e05-51b59dd526d0906c031733a4bd88fad4/tiles/{z}/{x}/{y}"
};

// ================== MAP INIT ==================
var map = L.map("map").setView([11.0, 106.5], 11);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

let boundaryLayer = null;  
let ndviLayer = null;

fetch("/data/green.json")
    .then(res => res.json())
    .then(json => init(json));

// ================== INIT ==================
function init(data) {
    const years = data.features.map(f => f.properties.year);

    let select = document.getElementById("yearSelect");
    let yearA = document.getElementById("yearA");
    let yearB = document.getElementById("yearB");

    years.forEach(y => {
        select.innerHTML += `<option>${y}</option>`;
        yearA.innerHTML += `<option>${y}</option>`;
        yearB.innerHTML += `<option>${y}</option>`;
    });

    drawChart(data);

    select.onchange = () => updateYear(data, select.value);
    yearA.onchange = () => {};
    yearB.onchange = () => {};

    updateYear(data, years[0]);
}

function updateYear(data, year) {
    showLoading(); 
    let f = data.features.find(x => x.properties.year == year);

    if (ndviLayer) map.removeLayer(ndviLayer);
    ndviLayer = L.tileLayer(tileUrl[year], { opacity: 1.0 }).addTo(map);  
    document.getElementById("areaValue").textContent = f.properties.green_area_km2.toFixed(2) + " km²";
    document.getElementById("ratioValue").textContent = (f.properties.green_ratio * 100).toFixed(1) + "%";
    document.getElementById("monthValue").textContent = f.properties.last_data_month;

    updateNote(year);
    setTimeout(hideLoading, 500); 
}

// ================== YEAR NOTES ==================
const notes = {
    2019: "Năm 2019: độ xanh ổn định, chưa có biến động mạnh.",
    2020: "Năm 2020: ảnh hưởng Covid làm giảm hoạt động công nghiệp → xanh nhỉnh hơn.",
    2021: "Năm 2021: tỷ lệ xanh tăng mạnh nhất giai đoạn giãn cách.",
    2022: "Năm 2022: công nghiệp hoạt động lại, xanh giảm nhẹ.",
    2023: "Năm 2023: xu hướng xanh tăng lại, ổn định.",
    2024: "Năm 2024: biến động ít, duy trì mức xanh khá.",
    2025: "Năm 2025: xanh tăng đáng kể, dữ liệu cập nhật tháng mới."
};

function updateNote(year) {
    document.getElementById("noteText").textContent = notes[year];
}

// ================== CHART ==================
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
                backgroundColor: "#ffbcd6",
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        }
    });
}

// ================== BUTTON LOGIC ==================

// Không gian xanh
document.getElementById("btnGreen").onclick = () => {
    showLoading();
    let y = document.getElementById("yearSelect").value;
    if (ndviLayer) map.removeLayer(ndviLayer);
    ndviLayer = L.tileLayer(tileUrlGreen[y], { opacity: 1.0 }).addTo(map);  // Opacity 1.0
    setTimeout(hideLoading, 500);
};

// Biến động 2019→2025
document.getElementById("btnDiff").onclick = () => {
    showLoading();
    if (ndviLayer) map.removeLayer(ndviLayer);
    ndviLayer = L.tileLayer(tileUrlDiff["2019_2025"], { opacity: 1.0 }).addTo(map);  // Opacity 1.0
    setTimeout(hideLoading, 500);
};

// So sánh 2 năm
document.getElementById("compareBtn").onclick = () => {
    let a = document.getElementById("yearA").value;
    let b = document.getElementById("yearB").value;

    if (a === b) return alert("Hãy chọn 2 năm khác nhau!");

    showLoading();
    if (ndviLayer) map.removeLayer(ndviLayer);
    ndviLayer = L.tileLayer(tileUrl[b], { opacity: 1.0 }).addTo(map);  // Opacity 1.0
    setTimeout(hideLoading, 500);
};

// ================== UI INTERACTIONS ==================

document.getElementById("toggle-btn").onclick = () => {
    const sidebar = document.getElementById("sidebar");
    const mapEl = document.getElementById("map");
    sidebar.classList.toggle("sidebar-collapsed");
    if (sidebar.classList.contains("sidebar-collapsed")) {
        mapEl.style.left = "0";
    } else {
        mapEl.style.left = "300px";
    }
};

document.getElementById("chartToggle").onclick = () => {
    const panel = document.getElementById("chartPanel");
    panel.classList.toggle("chart-collapsed");
};

function showLoading() {
    document.getElementById("loading").style.display = "flex";
}

function hideLoading() {
    document.getElementById("loading").style.display = "none";
}
