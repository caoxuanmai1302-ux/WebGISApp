// ================== TILE URLS ==================
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

// ================== MODE ==================
let currentMode = "ndvi";

// ================== MAP ==================
var map = L.map("map").setView([11.0, 106.5], 11);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

let activeLayer = null;
let compareLayerA = null;
let compareLayerB = null;

// ================== LOAD DATA ==================
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

    select.onchange = () => updateLayer(data, select.value);

    updateLayer(data, years[0]); 
}

// ================== UPDATE MAP ==================
function updateLayer(data, year) {
    let f = data.features.find(x => x.properties.year == year);

    if (activeLayer) map.removeLayer(activeLayer);
    if (compareLayerA) map.removeLayer(compareLayerA);
    if (compareLayerB) map.removeLayer(compareLayerB);

    hideLegends();
    document.getElementById("opacityCompare").style.display = "none";

    if (currentMode === "ndvi") {
        activeLayer = L.tileLayer(tileUrl[year], { opacity: 1 }).addTo(map);
        document.getElementById("legendNDVI").style.display = "block";
    }
    else if (currentMode === "green") {
        activeLayer = L.tileLayer(tileUrlGreen[year], { opacity: 1 }).addTo(map);
    }
    else if (currentMode === "diff") {
        activeLayer = L.tileLayer(tileUrlDiff["2019_2025"], { opacity: 1 }).addTo(map);
        updateNote("diff");
        document.getElementById("legendDiff").style.display = "block";
        return;
    }

    document.getElementById("areaValue").textContent = f.properties.green_area_km2.toFixed(2) + " km²";
    document.getElementById("ratioValue").textContent = (f.properties.green_ratio * 100).toFixed(1) + "%";
    updateNote(year);
}

// ================== NOTES ==================
const ndviNotes = {
    2019: "Năm 2019, NDVI duy trì mức trung bình–khá. Thảm thực vật ổn định, phân bố đều tại các khu vực nông nghiệp và sinh thái truyền thống.",
    2020: "Năm 2020 có NDVI thấp nhất do thời tiết khô hạn đầu năm và biến động mùa vụ. Đại dịch Covid cũng khiến canh tác bị gián đoạn.",
    2021: "NDVI phục hồi mạnh trong 2021 nhờ giãn cách xã hội làm giảm áp lực môi trường, cây trồng phục hồi tốt hơn.",
    2022: "2022 là năm xanh nhất, điều kiện khí hậu thuận lợi giúp NDVI đạt mức cao nhất trong toàn bộ chuỗi dữ liệu.",
    2023: "NDVI giảm nhẹ trong 2023 do mở rộng đô thị – công nghiệp, nhưng tổng thể vẫn ổn định.",
    2024: "Năm 2024 NDVI giảm nhẹ, một phần do xây dựng hạ tầng và biến động thời tiết theo mùa.",
    2025: "NDVI tăng trở lại vào 2025, nhiều vùng xanh phục hồi rõ rệt nhờ các chương trình trồng cây và cải tạo đất."
};

const greenNotes = {
    2019: "Mảng xanh 2019 liên tục, ít phân mảnh, đặc biệt mạnh ở các vùng nông nghiệp truyền thống.",
    2020: "GreenMap 2020 tăng nhẹ nhờ hoạt động sản xuất giảm trong đại dịch, giúp các vùng xanh liền mạch hơn.",
    2021: "Mảng xanh 2021 đạt độ phủ cao nhất, liên tục và rộng, thể hiện sự phục hồi mạnh của thảm thực vật.",
    2022: "Một số khu bị phân mảnh do phát triển hạ tầng nhưng tổng thể xanh vẫn lớn và ổn định.",
    2023: "Xanh giảm nhẹ, xuất hiện các điểm phân mảnh do các dự án dân cư – công nghiệp.",
    2024: "Năm 2024 duy trì mức xanh trung bình, mảng xanh hơi chia cắt nhưng không nghiêm trọng.",
    2025: "Mảng xanh 2025 phục hồi mạnh, nhiều khu vực liên tục trở lại nhờ trồng cây và cải tạo kênh rạch."
};

const diffNotes = {
    "diff": "Giai đoạn 2019–2025 ghi nhận sự thay đổi rõ rệt: 2019 có nền xanh ổn định, đến 2025 mức xanh tăng mạnh trở lại nhờ phục hồi tự nhiên và trồng cây."
};

// ================== UPDATE NOTES ==================
function updateNote(year) {
    let text = "";

    if (currentMode === "ndvi") text = ndviNotes[year];
    else if (currentMode === "green") text = greenNotes[year];
    else if (currentMode === "diff") text = diffNotes["diff"];
    else text = "Đang so sánh — không có đánh giá.";

    document.getElementById("noteText").textContent = text;
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

// ================== BUTTONS ==================
document.getElementById("btnNdvi").onclick = () => {
    currentMode = "ndvi";
    updateLayerFromUI();
};

document.getElementById("btnGreenmap").onclick = () => {
    currentMode = "green";
    updateLayerFromUI();
};

document.getElementById("btnDiff").onclick = () => {
    currentMode = "diff";
    updateLayerFromUI();
};

// ================== COMPARE (opacity slider) ==================
document.getElementById("compareBtn").onclick = () => {
    let a = document.getElementById("yearA").value;
    let b = document.getElementById("yearB").value;

    if (a === b) return alert("Hãy chọn 2 năm khác nhau!");

    currentMode = "compare";
    hideLegends();

    if (activeLayer) map.removeLayer(activeLayer);
    if (compareLayerA) map.removeLayer(compareLayerA);
    if (compareLayerB) map.removeLayer(compareLayerB);

    compareLayerA = L.tileLayer(tileUrl[a], { opacity: 1 }).addTo(map);
    compareLayerB = L.tileLayer(tileUrl[b], { opacity: 0.5 }).addTo(map);

    document.getElementById("opacityCompare").style.display = "block";

    document.getElementById("opacitySlider").oninput = (e) => {
        compareLayerB.setOpacity(e.target.value);
    };

    document.getElementById("noteText").textContent = "Đang so sánh hai năm — không hiển thị đánh giá.";
};

// ================== HELPERS ==================
function updateLayerFromUI() {
    const y = document.getElementById("yearSelect").value;
    fetch("/data/green.json")
        .then(r => r.json())
        .then(d => updateLayer(d, y));
}

function hideLegends() {
    const ndvi = document.getElementById("legendNDVI");
    const diff = document.getElementById("legendDiff");

    if (ndvi) ndvi.style.display = "none";
    if (diff) diff.style.display = "none";
}

// ================== UI ==================
document.getElementById("toggle-btn").onclick = () => {
    const sidebar = document.getElementById("sidebar");
    const mapEl = document.getElementById("map");
    const isCollapsed = sidebar.classList.toggle("sidebar-collapsed");
    mapEl.style.left = isCollapsed ? "0" : "300px";
};

document.getElementById("chartToggle").onclick = () => {
    const panel = document.getElementById("chartPanel");
    panel.classList.toggle("chart-collapsed");
};
