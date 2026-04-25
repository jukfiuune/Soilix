#include "config.h"

void initSensors() {
  Wire.begin();
  soilTempSensor.begin();
  Serial.print(F("[SENSOR] DS18B20 devices found: "));
  Serial.println(soilTempSensor.getDeviceCount());

  if (sht4.begin()) {
    sht4.setPrecision(SHT4X_HIGH_PRECISION);
    sht4Found = true;
    Serial.println(F("[SENSOR] SHT4x found."));
  } else {
    Serial.println(F("[SENSOR] SHT4x NOT found."));
  }

  if (bmp.begin(0x76) || bmp.begin(0x77)) {
    bmpFound = true;
    Serial.println(F("[SENSOR] BMP280 found."));
  } else {
    Serial.println(F("[SENSOR] BMP280 NOT found."));
  }

  pinMode(WIND_PIN, INPUT);
}


int getSoilMoisturePercent() {
  int rawSoil = analogRead(SOIL_PIN);
  int percent = map(rawSoil, SOIL_DRY_VALUE, SOIL_WET_VALUE, 0, 100);
  
  return constrain(percent, 0, 100);
}

float getWindSpeed() {
  unsigned long highTime = pulseIn(WIND_PIN, HIGH); // microseconds
  unsigned long lowTime  = pulseIn(WIND_PIN, LOW); // microseconds
  unsigned long period   = highTime + lowTime;

  if(period == 0) return 0.0;
  if(highTime == 0) return 0.0;

  return (830000.0 / period);
}

float getSoilTemperature() {
  soilTempSensor.requestTemperatures();
  return soilTempSensor.getTempCByIndex(0);
}

float getAirTemperature() {
  if (!sht4Found) return -127.0; // Return error value if offline
  sensors_event_t humEvent, tempEvent;
  sht4.getEvent(&humEvent, &tempEvent);
  return tempEvent.temperature;
}

float getAirHumidity() {
  if (!sht4Found) return -127.0; 
  sensors_event_t humEvent, tempEvent;
  sht4.getEvent(&humEvent, &tempEvent);
  return humEvent.relative_humidity;
}

float getAirPressure() {
  if (!bmpFound) return -127.0;
  return bmp.readPressure() / 100.0F; // Convert Pa to hPa
}

String getSensorPayload() {
  int soilMoisture = getSoilMoisturePercent();
  float soilTemp   = getSoilTemperature();
  float airTemp    = getAirTemperature();
  float airHum     = getAirHumidity();
  float airPress   = getAirPressure();
  float windSpeed  = getWindSpeed();

  String soilTempStr = (soilTemp == DEVICE_DISCONNECTED_C) ? "-127" : String(soilTemp, 1);

  return String(airTemp,  1)   + " "
       + String(airHum,   1)   + " "
       + String(airPress, 1)   + " "
       + String(soilMoisture)  + " "  
       + soilTempStr           + " "
       + String(windSpeed);
}