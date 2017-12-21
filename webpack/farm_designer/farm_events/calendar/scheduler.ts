import * as moment from "moment";
import { Moment, unitOfTime } from "moment";
import { take, filter, range } from "lodash";
import { TimeUnit } from "../../interfaces";
import { NEVER } from "../edit_fe_form";

interface SchedulerProps {
  startTime: Moment;
  currentTime: Moment;
  endTime: Moment;
  intervalSeconds: number;
}

const nextYear = () => moment(moment().add(1, "year"));

export function scheduler({
  startTime,
  currentTime,
  endTime,
  intervalSeconds
}: SchedulerProps): Moment[] {
  return take(filter(
    // Generate all occurrences in Farm Event.
    range(startTime.unix(), endTime.unix(), intervalSeconds),
    // Filter out past occurrences.
    // Match FarmBot OS calendar item execution grace period (60 seconds).
    (itemTime) => itemTime >= (currentTime.unix() - 60)),
    // Take only the next 60 occurrences for performance reasons.
    60) // At the least, this provides the next hour of calendar items.
    // Convert from seconds back to Moment.
    .map(x => moment.unix(x));
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

/** GIVEN: A time unit (hourly, weekly, etc) and a repeat (number)
 *  RETURNS: Number of seconds for interval.
 *  EXAMPLE: f(2, "minutely") => 120; // "Every two minutes"
 */
export function farmEventIntervalSeconds(repeat: number, unit: TimeUnit) {
  const momentUnit = LOOKUP[unit];
  if ((unit === NEVER) || !(momentUnit)) {
    return 0;
  } else {
    return moment.duration(repeat, momentUnit).asSeconds();
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
  current_time?: string;
}
/** Takes a subset of FarmEvent<Sequence> data and generates a list of dates. */
export function scheduleForFarmEvent(
  { start_time, end_time, repeat, time_unit }: TimeLine, timeNow = moment()
): Moment[] {
  const interval = repeat && farmEventIntervalSeconds(repeat, time_unit);
  if (interval && (time_unit !== NEVER)) {
    const schedule = scheduler({
      startTime: moment(start_time),
      currentTime: timeNow,
      endTime: end_time ? moment(end_time) : nextYear(),
      intervalSeconds: interval
    });
    return schedule;
  } else {
    const gracePeriod = timeNow.clone().subtract(1, "minute");
    if (moment(end_time).isSameOrAfter(gracePeriod)) {
      return [moment(start_time)];
    } else {
      return [];
    }
  }
}
