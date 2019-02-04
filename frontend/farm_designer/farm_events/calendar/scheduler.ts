import { duration } from "moment";
import * as moment from "moment";
import { Moment, unitOfTime } from "moment";
import { range } from "lodash";
import { NEVER } from "../edit_fe_form";
import { TimeUnit } from "farmbot/dist/resources/api_resources";

interface SchedulerProps {
  startTime: Moment;
  currentTime: Moment;
  endTime: Moment;
  intervalSeconds: number;
}

const nextYear = () => moment(moment().add(1, "year"));

/** Limit the number of calendar items displayed for performance reasons.
 * At the least, `60` provides the next hour of calendar items. */
export const maxDisplayItems = 60;
// Match FarmBot OS calendar item execution grace period (1 minute).
export const gracePeriodSeconds = 60;

export function scheduler({
  startTime,
  currentTime,
  endTime,
  intervalSeconds
}: SchedulerProps): { items: Moment[], shortenedBy: number } {
  // Convert from Moment to seconds.
  const eventStartTime = startTime.unix();
  const eventEndTime = endTime.unix();
  const cutoffTime = currentTime.unix() - gracePeriodSeconds;

  // Calculate the next Farm Event item time.
  const timeSinceStart = cutoffTime - eventStartTime;
  const itemsMissed = Math.ceil(timeSinceStart / intervalSeconds);
  // Negative timeSinceStart: start time is in the future. No items missed.
  const nextItemTime = timeSinceStart > 0
    ? eventStartTime + itemsMissed * intervalSeconds
    : eventStartTime;

  // Calculate the last displayed Farm Event item time.
  const itemEndTime = nextItemTime + maxDisplayItems * intervalSeconds;
  const lastItemTime = itemEndTime < eventEndTime
    ? itemEndTime
    : eventEndTime;

  // Calculate the number of future items hidden from the calendar.
  const shortenedBy = Math.ceil(
    Math.abs(eventEndTime - lastItemTime) / intervalSeconds);

  /** Generate the list of Farm Event items to display
   * and convert from seconds back to Moment. */
  const items = range(nextItemTime, lastItemTime, intervalSeconds)
    .map(x => moment.unix(x));

  return { items, shortenedBy };
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
    return duration(repeat, momentUnit).asSeconds();
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
): { items: Moment[], shortenedBy: number } {
  const interval = repeat && farmEventIntervalSeconds(repeat, time_unit);
  const gracePeriod = timeNow.clone().subtract(gracePeriodSeconds, "seconds");

  // Farm event is over.
  if (moment(end_time).isBefore(gracePeriod)) {
    return { items: [], shortenedBy: 0 };
  }

  if (interval && (time_unit !== NEVER)) {
    // Repeating event.
    const schedule = scheduler({
      startTime: moment(start_time),
      currentTime: timeNow,
      endTime: end_time ? moment(end_time) : nextYear(),
      intervalSeconds: interval
    });
    return { items: schedule.items, shortenedBy: schedule.shortenedBy };
  } else {
    // Non-repeating event.
    return { items: [moment(start_time)], shortenedBy: 0 };
  }
}
