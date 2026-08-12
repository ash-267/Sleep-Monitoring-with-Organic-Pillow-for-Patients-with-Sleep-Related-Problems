#include <Arduino.h>

// RestNTravel ESP32-S3 node skeleton.
// TODO: integrate FSR, MPU6050, MAX30102, DHT22, MEMS mic sampling and batching.
// TODO: post timestamped readings to backend /api/ingest with X-Device-Key header.

void setup() {
  Serial.begin(115200);
  Serial.println("RestNTravel ESP32 node skeleton initialized");
}

void loop() {
  // TODO: collect sensors and send JSON payload.
  delay(2000);
}
