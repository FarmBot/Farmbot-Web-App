import { ANALOG, TaggedSensor, TaggedSensorReading } from "farmbot";

export const filterMoistureReadings = (
  sensorReadings: TaggedSensorReading[],
  sensors: TaggedSensor[],
) => {
  const sensorNameByPinLookup: { [x: number]: string } = {};
  sensors.map(x => { sensorNameByPinLookup[x.body.pin || 0] = x.body.label; });
  const readings = sensorReadings
    .filter(r =>
      (sensorNameByPinLookup[r.body.pin] || "").toLowerCase().includes("soil")
      && r.body.mode == ANALOG)
    .filter(r => r.body.value <= 900);
  return { readings, sensorNameByPinLookup };
};
