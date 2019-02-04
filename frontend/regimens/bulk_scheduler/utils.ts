import moment from "moment";
import { isNumber, padStart } from "lodash";

export function msToTime(ms: number) {
  if (isNumber(ms)) {
    const d = moment.duration(ms);
    const h = padStart(d.hours().toString(), 2, "0");
    const m = padStart(d.minutes().toString(), 2, "0");
    return `${h}:${m}`;
  } else {
    return "00:01";
  }
}

export function timeToMs(input: string) {
  const [hours, minutes] = input
    .split(":")
    .map((n: string) => parseInt(n, 10));
  return ((hours * 60) + (minutes)) * 60 * 1000;
}
