import { PingDictionary } from "../../devices/connectivity/qos";

export function fakePings(): PingDictionary {
  return {
    "a": { kind: "timeout", start: 111, end: 423 },
    "b": { kind: "pending", start: 213 },
    "c": { kind: "complete", start: 319, end: 631 }
  };
}
