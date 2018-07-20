import { TaggedSensorReading } from "../../resources/tagged_resources";
import { SensorReadingsState } from "./interfaces";
import { every, isNumber } from "lodash";
import { Xyz } from "../../devices/interfaces";
import * as moment from "moment";

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

      /** Time period begin. */
      const begin = endDate - (period === "current" ? 1 : 2) * timePeriod;
      /** Time period end. */
      const end = period === "current" ? endDate : endDate - timePeriod;

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
