import { TaggedGenericPointer, TaggedSensorReading } from "farmbot";

const roundToTens = (value: number) => Math.round(value / 10) * 10;

export function selectMostRecentPoints
  <T extends (TaggedGenericPointer | TaggedSensorReading)>(points: T[]) {
  const byLocation = new Map<string, T>();
  points.map(point => {
    const { x, y, updated_at } = point.body;
    if (x == undefined || y == undefined) { return; }
    const key = `${roundToTens(x)}:${roundToTens(y)}`;
    const previous = byLocation.get(key);
    if (!previous || (updated_at || "") >= (previous.body.updated_at || "")) {
      byLocation.set(key, point);
    }
  });
  return Array.from(byLocation.values());
}
