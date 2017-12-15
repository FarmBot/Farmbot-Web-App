import * as moment from "moment";
import { Moment, unitOfTime } from "moment";
import { times, last } from "lodash";
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
  if (currentTime > endTime) {
    return []; // Farm event is over
  }
  const timeSinceStart = currentTime.unix() - startTime.unix();
  const itemsMissed = Math.floor(timeSinceStart / intervalSeconds);
  const nextItemTime = startTime.clone()
    .add((itemsMissed * intervalSeconds), "seconds");
  const scheduledItems = [
    timeSinceStart > 0
      ? nextItemTime // start time in the past
      : startTime];  // start time in the future
  times(60, () => {  // get next 60 or so calendar items
    const previousItem = last(scheduledItems);
    if (previousItem) {
      const nextItem = previousItem.clone().add(intervalSeconds, "seconds");
      if (nextItem.isBefore(endTime)) {
        scheduledItems.push(nextItem);
      }
    }
  });
  // Match FarmBot OS calendar item execution grace period
  const gracePeriodCutoffTime = currentTime.subtract(1, "minutes");
  return scheduledItems.filter(m => m.isAfter(gracePeriodCutoffTime));
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
  { start_time, end_time, repeat, time_unit, current_time = moment() }: TimeLine
): Moment[] {
  const interval = repeat && farmEventIntervalSeconds(repeat, time_unit);
  if (interval && (time_unit !== NEVER)) {
    const schedule = scheduler({
      startTime: moment(start_time),
      currentTime: moment(current_time),
      endTime: end_time ? moment(end_time) : nextYear(),
      intervalSeconds: interval
    });
    return schedule;
  } else {
    return [moment(start_time)];
  }
}
