import { Week, DAYS } from "./interfaces";
import { Sequence } from "../../sequences/interfaces";
import { RegimenItem } from "../../regimens/interfaces";

/** Calculates correct time_offset for a group of RegimenItem[]s based on a
 * set of weeks and a desired offset. */
export function groupRegimenItemsByWeek(weeks: Week[], OFFSET: number,
  seq: Sequence) {
  const ONE_WEEK = 604800000;
  const ONE_DAY = 86400000;

  return weeks
    // Collect all of the true/false values in weekX.days. These indicate
    // whether we should add a sequence on that day or not.
    .map((week) => DAYS.map((key) => week.days[key]))
    // [[true,false,false,true] . . . ]
    // Convert true values to an offset, in milliseconds from the
    // start point.
    // Convert false values to -1.
    .map((weekArray, weekNum) => {
      const tweeks = ONE_WEEK * (weekNum);
      return weekArray.map((shouldExecute, dayNum) => {
        const days = ONE_DAY * dayNum;
        return (shouldExecute) ? (tweeks + days + OFFSET) : -1;
        // lol, In band signaling.
      });
    })// [[-1, 99999, -1, -1],[.....]]
    // "flatten" the array into a 1d structure (it's an array of
    // number arrays right now)
    .reduce((arr, acc) => acc.concat(arr))
    // Remove -1 values (days that don't execute a sequence).
    .filter((i) => i !== -1)
    // Sort the array. Using a comparator function because failing to do so
    // results in funny execution times on day 0.
    .sort(function (a, b) {
      if (a < b) { return -1; }
      return (a > b) ? 1 : 0;
    })
    // Transform the sorted array of values into a regimenItem[] array.
    .map<RegimenItem>(time_offset => {
      if (seq.id) {
        return { time_offset, sequence_id: seq.id };
      } else {
        throw new Error("Impossible???");
      }
    });
}
