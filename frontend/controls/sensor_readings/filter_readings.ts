import { TaggedSensorReading } from "farmbot";
import { SensorReadingsState } from "./interfaces";
import { every, isNumber } from "lodash";
import { Xyz } from "../../devices/interfaces";
import moment from "moment";

/** One day in seconds. */
const oneDay = 3600 * 24;
/** Calculate a sensor reading filtered time period end time in seconds. */
export const calcEndOfPeriod = (
  timePeriod: number,
  endDate: number,
  period: "current" | "previous"
) => endDate + oneDay
  - timePeriod * (period === "current" ? 0 : 1);

/** Filter sensor readings using sensor history widget state. */
export const filterSensorReadings =
  (sensorReadings: TaggedSensorReading[],
    sensorReadingsState: SensorReadingsState) =>
    (period: "current" | "previous"): TaggedSensorReading[] => {
      const {
        sensor, endDate, timePeriod, showPreviousPeriod, location, deviation
      } = sensorReadingsState;

      // Don't return sensor readings from the previous period if not desired.
      if (period === "previous" && !showPreviousPeriod) { return []; }

      /** Time period end. */
      const end = calcEndOfPeriod(timePeriod, endDate, period);
      /** Time period begin. */
      const begin = end - timePeriod;

      return sensorReadings
        // Filter by date
        .filter(x => {
          const readingCreatedAt = moment(x.body.created_at).unix();
          return (readingCreatedAt >= begin && readingCreatedAt < end);
        })
        // Filter by sensor pin
        .filter(x => sensor ? x.body.pin === sensor.body.pin : true)
        // Filter by location
        .filter(sensorReading => {
          if (location) {
            const { body } = sensorReading;
            return every(["x", "y", "z"].map((axis: Xyz) => {
              const a = body[axis];
              const input = location[axis];
              return isNumber(a) && isNumber(input)
                ? (a <= input + deviation) && (a >= input - deviation)
                : true;
            }));
            // Location filter not specified.
          } else { return true; }
        });
    };
