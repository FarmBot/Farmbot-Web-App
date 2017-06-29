import * as moment from "moment";
import {
  FarmEventWithExecutable
} from "../farm_designer/farm_events/calendar/interfaces";

export const TIME = {
  MONDAY: moment("2017-06-19 01:30:00 -0500"),
  TUESDAY: moment("2017-06-20 02:00:00 -0500"),
  WEDNESDAY: moment("2017-06-21 03:45:00 -0500"),
  THURSDAY: moment("2017-06-22 14:00:00 -0500"),
  FRIDAY: moment("2017-06-23 00:05:37 -0500"),
  SATURDAY: moment("2017-06-24 23:00:00 -0500")
};

export let fake_fe = (): FarmEventWithExecutable => {
  return {
    id: 1,
    start_time: "---",
    repeat: 5,
    time_unit: "daily",
    executable_id: 23,
    executable_type: "Sequence",
    executable: {
      color: "red",
      name: "faker",
      kind: "sequence",
      args: { version: 0 }
    }
  }
};
