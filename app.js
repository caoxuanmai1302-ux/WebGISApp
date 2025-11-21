// ======================= MAP INIT ==========================
var map = L.map('map').setView([11.05, 106.5], 11);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

// ======================= SIDEBAR COLLAPSE ===================
document.getElementById("toggle-btn").onclick = () => {
    const sb = document.getElementById("sidebar");
    if (sb.style.left === "-300px") {
        sb.style.left = "0px";
        document.getElementById("map").style.left = "300px";
    } else {
        sb.style.left = "-300px";
        document.getElementById("map").style.left = "0px";
    }
};

// ======================= YEAR SELECT ========================
const years = [2019,2020,2021,2022,2023,2024,2025];
const select = document.getElementById("yearSelect");
const selectA = document.getElementById("yearA");
const selectB = document.getElementById("yearB");

years.forEach(y => {
    select.innerHTML += `<option>${y}</option>`;
    selectA.innerHTML += `<option>${y}</option>`;
    selectB.innerHTML += `<option>${y}</option>`;
});

// ======================= CHART =============================
const chart = new Chart(document.getElementById("chart"), {
    type: 'line',
    data: {
        labels: years,
        datasets: [{
            label: "Diện tích xanh (km²)",
            data: [300,280,310,330,290,295,315],
            borderWidth: 3,
            borderColor: "#008000",
            backgroundColor: "#90ee90",
            tension: 0.3,
            pointRadius: 5
        }]
    }
});

// ======================= RESET VIEW ========================
function resetView(){
    map.setView([11.05,106.5],11);
}

// ======================= SIMULATED NDVI LAYER ====================
let boundary = null;

// Fake ranh giới Củ Chi
fetch("https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements.geojson")
.then(r=>r.json()).then(data =>{
    boundary = L.geoJSON(data.features[0],{
        style:{
            color:"red",
            weight:3,
            fillColor:"#ff91c2",
            fillOpacity:0.3
        }
    }).addTo(map);
});

// =================== MINI STATS UPDATE ======================
function updateStats(){
    const area=[300,280,310,330,290,295,315];
    const idx = select.selectedIndex;

    document.getElementById("areaValue").innerText = area[idx] + " km²";
    document.getElementById("changeValue").innerText =
        (idx>0? (((area[idx]-area[idx-1])/area[idx-1])*100).toFixed(1)+"%" : "--");
    document.getElementById("monthValue").innerText = (5 + idx) + "";
}

select.onchange = updateStats;
updateStats();

// =================== CHATBOX SIMPLE BOT =====================
document.getElementById("chatInput").addEventListener("keydown", function(e){
    if(e.key==="Enter"){
        const msg = this.value;
        if(msg.trim()==="") return;

        document.getElementById("chatContent").innerHTML += `<p><b>Mai:</b> ${msg}</p>`;
        this.value="";

        setTimeout(()=>{
            document.getElementById("chatContent").innerHTML += `<p><b>Bot:</b> Mình hiểu rồi nè 💗</p>`;
        },500);
    }
});
