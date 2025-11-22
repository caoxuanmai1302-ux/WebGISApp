// ================== TILE URLS ==================
const tileUrl = {
    "2019": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/18fb5026fc487d710ca33009fc8cb1f0-817f817475e0572239c8ff118a213a19/tiles/{z}/{x}/{y}",
  "2020": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/4e5da608f6e88df92663bdcb8abfeaad-77c3a3d46bb467bfabf639368b1af299/tiles/{z}/{x}/{y}",
  "2021": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/8c9602aca4c6c7579dd9aa6b15227770-36e773f133864acd155003042500780f/tiles/{z}/{x}/{y}",
  "2022": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/8db91606e736c5fe0a7191d3083ffd7f-0375013b6d6b37217758b577dcb6bcf6/tiles/{z}/{x}/{y}",
  "2023": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/8cb70bc23fc422f5f59a440c524b337a-12b36840a7d0e7496af0c4176e3d9a68/tiles/{z}/{x}/{y}",
  "2024": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/c39e02edf71919e4374b867dd25905bc-709992e59a7fd2e6d39b31290a3ee597/tiles/{z}/{x}/{y}",
  "2025": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/d5b597928ca29ebcf84e1c6ead63bb75-a7082b23a1a7d27928fb93fa9bf7df30/tiles/{z}/{x}/{y}"
};

const tileUrlGreen = {
   "2019": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/0e39b71ead1cb600c76c0102f2c157d4-ad18613e093fc7bca723ba210cba56e6/tiles/{z}/{x}/{y}",
  "2020": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/3667d81bd03856bed6d74e8b65554b6e-8650b3e63a38c958027e55b2a407825b/tiles/{z}/{x}/{y}",
  "2021": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/19bd4e4c7814380b1e8ba0b60effcc10-39ab79ab41efe444b005a75d407dc352/tiles/{z}/{x}/{y}",
  "2022": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/998a83f543a05703f8f35209ae03d1c0-5cf09421bbcb823d08cf3a211805133e/tiles/{z}/{x}/{y}",
  "2023": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/5d3ed8909d2a53b9c51e4c0dc44b2010-2021967300a74cfe97792d5e95f20c46/tiles/{z}/{x}/{y}",
  "2024": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/40704bde0d462af1acddb6981fc959a9-cb4f113962c44c143890bc727c7508c7/tiles/{z}/{x}/{y}",
  "2025": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/2b0702f2a3f3ce5c5c6ab88fc96e1dd1-280e1478ddaf6cb5bc9914cf1e031be9/tiles/{z}/{x}/{y}"
};

const tileUrlDiff = {
    "2019_2025": "https://earthengine.googleapis.com/v1/projects/tidy-centaur-477505-s2/maps/cd4a00a834d5a5a1677ea934b55a8559-f38be4a7fd8d04721c242b35889e2f67/tiles/{z}/{x}/{y}"
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
