import * as moment from "moment";
import { Moment, unitOfTime } from "moment";
import { times, last } from "lodash";
import { TimeUnit } from "../../interfaces";
import { NEVER } from "../edit_fe_form";

interface SchedulerProps {
  originTime: Moment;
  intervalSeconds: number;
  lowerBound: Moment;
  upperBound?: Moment;
}

let nextYear = () => moment(moment().add(1, "year"));

export function scheduler({ originTime,
  intervalSeconds,
  lowerBound,
  upperBound }: SchedulerProps): Moment[] {

  upperBound = upperBound || nextYear();
  // # How many items must we skip to get to the first occurence?
  let skip_intervals =
    Math.ceil((lowerBound.unix() - originTime.unix()) / intervalSeconds);
  // # At what time does the first event occur?
  let first_item = originTime
    .clone()
    .add((skip_intervals * intervalSeconds), "seconds");
  let list = [first_item];
  times(60, () => {
    let x = last(list);
    if (x) {
      let item = x.clone().add(intervalSeconds, "seconds");
      if (item.isBefore(upperBound)) {
        list.push(item);
      }
    }
  });
  return list;
}

/** Translate farmbot interval names to momentjs interval names */
const LOOKUP: Record<TimeUnit, unitOfTime.Base> = {
  "never": "ms",
  "minutely": "minutes",
  "hourly": "hours",
  "daily": "days",
  "weekly": "weeks",
  "monthly": "months",
  "yearly": "years",
};

interface ConversionProps {
  repeat: number;
  time_unit: TimeUnit;
}

/** GIVEN: A time unit (hourly, weekly, etc) and a repeat (number)
 *  RETURNS: Number of seconds for interval.
 *  EXAMPLE: f(2, "minutely") => 120;
 */
export function farmEventIntervalSeconds(repeat: number, unit: TimeUnit) {
  let momentUnit = LOOKUP[unit];
  if ((unit === NEVER) || !(momentUnit)) {
    return moment.duration(repeat, momentUnit).asSeconds();
  } else {
    console.warn("Using 0 as an interval...");
    return 0;
  }
}

/** Intentionally mimics structure of FarmEvent,
 * but only the time/vector parts. */
export interface TimeLine {
  repeat?: number | undefined;
  time_unit: TimeUnit;
  /** ISO string */
  start_time: string;
  /** ISO string */
  end_time?: string | undefined;
}
/** Takes a subset of FarmEvent<Sequence> data and generates a list of dates. */
export function scheduleForFarmEvent({ start_time, end_time, repeat, time_unit }:
  TimeLine): Moment[] {
  if (repeat && (time_unit !== NEVER)) {
    return scheduler({
      originTime: moment(start_time),
      lowerBound: moment(start_time),
      upperBound: end_time ? moment(end_time) : nextYear(),
      intervalSeconds: farmEventIntervalSeconds(repeat, time_unit)
    });
  } else {
    console.warn("Repeat was undefined or 0. Hmm..");
    return [];
  }
}
