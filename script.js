const ESP32 = `http://${CONFIG.ESP32_IP}`;

const ctx = document.getElementById("gasChart").getContext("2d");

let labels = [];
let values = [];

let interval;

const chart = new Chart(ctx,{
type:"line",
data:{
labels:labels,
datasets:[{
label:"Methane ppm",
data:values,
borderColor:"red",
tension:0.3
}]
},
options:{
animation:false,
responsive:true
}
});

async function fetchData(){

try{

const response = await fetch(ESP32 + CONFIG.DATA_ENDPOINT);

const data = await response.json();

const ppm = data.methane;

document.getElementById("ppm").innerHTML = ppm.toFixed(2)+" ppm";

if(ppm > CONFIG.THRESHOLD){

document.getElementById("status").innerHTML="⚠ GAS DETECTED";

document.getElementById("status").classList.add("alert");

playAlarm();

}
else{

document.getElementById("status").innerHTML="SAFE";

document.getElementById("status").classList.remove("alert");

}

const time = new Date().toLocaleTimeString();

labels.push(time);

values.push(ppm);

if(labels.length > 40){

labels.shift();
values.shift();

}

chart.update();

calculateAverage();

}catch(error){

document.getElementById("status").innerHTML="Sensor Offline";

}

}

function calculateAverage(){

let sum = 0;

for(let i=0;i<values.length;i++){

sum += values[i];

}

let avg = (sum/values.length).toFixed(2);

document.getElementById("avg").innerHTML = avg + " ppm";

}

function startSensing(){

fetch(ESP32 + CONFIG.START_ENDPOINT);

interval = setInterval(fetchData, CONFIG.UPDATE_INTERVAL);

document.getElementById("status").innerHTML="Monitoring";

}

function stopSensing(){

fetch(ESP32 + CONFIG.STOP_ENDPOINT);

clearInterval(interval);

document.getElementById("status").innerHTML="Stopped";

}

function clearGraph(){

labels = [];

values = [];

chart.data.labels = labels;

chart.data.datasets[0].data = values;

chart.update();

}

function downloadData(){

let csv = "Time,PPM\n";

for(let i=0;i<labels.length;i++){

csv += labels[i]+","+values[i]+"\n";

}

let blob = new Blob([csv],{type:"text/csv"});

let link = document.createElement("a");

link.href = URL.createObjectURL(blob);

link.download = "methane_data.csv";

link.click();

}

function playAlarm(){

let audio = new Audio("alarm.mp3");

audio.play();

}

document.getElementById("startBtn").onclick = startSensing;

document.getElementById("stopBtn").onclick = stopSensing;

document.getElementById("clearBtn").onclick = clearGraph;

document.getElementById("downloadBtn").onclick = downloadData;