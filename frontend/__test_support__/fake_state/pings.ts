import { PingDictionary } from "../../devices/connectivity/qos";

export function fakePings(): PingDictionary {
  return {
    "a": { kind: "timeout", start: 1, end: 4, id: "a" },
    "b": { kind: "pending", start: 1, end: 4, id: "b" },
    "c": { kind: "complete", start: 2, end: 3, id: "c" }
  };
}
