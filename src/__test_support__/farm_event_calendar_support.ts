import * as moment from "moment";
import {
  FarmEventWithExecutable
} from "../farm_designer/farm_events/calendar/interfaces";

export const TIME = {
  MONDAY: moment("2017-06-19T06:30:00.000-05:00"),
  TUESDAY: moment("2017-06-20T06:30:00.000-05:00"),
  WEDNESDAY: moment("2017-06-21T06:30:00.000-05:00"),
  THURSDAY: moment("2017-06-22T06:30:00.000-05:00"),
  FRIDAY: moment("2017-06-23T06:30:00.000-05:00"),
  SATURDAY: moment("2017-06-24T06:30:00.000-05:00")
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
  };
};
