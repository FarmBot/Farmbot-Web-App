import { ANALOG, TaggedSensor, TaggedSensorReading } from "farmbot";

export const filterMoistureReadings = (
  sensorReadings: TaggedSensorReading[],
  sensors: TaggedSensor[],
) => {
  const sensorNameByPinLookup: { [x: number]: string } = {};
  sensors.map(x => { sensorNameByPinLookup[x.body.pin || 0] = x.body.label; });
  const moistureSensorPins = sensors
    .filter(sensor => sensor.body.type == "soil_moisture")
    .map(sensor => sensor.body.pin);
  const readings = sensorReadings
    .filter(r =>
      moistureSensorPins.includes(r.body.pin)
      && r.body.mode == ANALOG)
    .filter(r => r.body.value <= 900);
  return { readings, sensorNameByPinLookup };
};
