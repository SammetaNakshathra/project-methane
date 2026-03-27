#include <WiFi.h>
#include <WebServer.h>

const char* ssid = "YOUR_WIFI";
const char* password = "YOUR_PASSWORD";

WebServer server(80);

const int sensorPin = 34;
const int buzzer = 26;

bool sensing = false;

int methaneValue = 0;
float voltage = 0;
float ppm = 0;

void setup() {

Serial.begin(115200);

pinMode(buzzer, OUTPUT);

WiFi.begin(ssid,password);

Serial.print("Connecting");

while(WiFi.status()!=WL_CONNECTED){
delay(500);
Serial.print(".");
}

Serial.println("");
Serial.println("Connected");
Serial.print("IP Address: ");
Serial.println(WiFi.localIP());

server.on("/data", handleData);
server.on("/start", handleStart);
server.on("/stop", handleStop);
server.on("/health", handleHealth);

server.begin();

}

void loop(){
server.handleClient();
}

void handleStart(){

sensing = true;

server.send(200,"text/plain","Sensing Started");

}

void handleStop(){

sensing = false;

digitalWrite(buzzer,LOW);

server.send(200,"text/plain","Sensing Stopped");

}

void handleHealth(){

String json = "{";
json += "\"device\":\"ESP32 Methane Detector\",";
json += "\"wifi\":\"connected\",";
json += "\"sensor\":\"active\"";
json += "}";

server.send(200,"application/json",json);

}

void handleData(){

if(sensing){

methaneValue = analogRead(sensorPin);

voltage = methaneValue * (3.3/4095.0);

ppm = voltage * 1000;

if(ppm > 300){
digitalWrite(buzzer,HIGH);
}
else{
digitalWrite(buzzer,LOW);
}

}

String json = "{";

json += "\"methane\":";
json += ppm;
json += ",";

json += "\"adc\":";
json += methaneValue;
json += ",";

json += "\"sensing\":";
json += sensing ? "true":"false";

json += "}";

server.send(200,"application/json",json);

}