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

export let calendarRows = [
  {
    "sortKey": 1500922800,
    "month": "Jul",
    "day": 24,
    "items": [
      {
        "mmdd": "0724",
        "sortKey": 1500922800,
        "timeStr": "02:00pm",
        "parentExecutableName": "Every 4 hours",
        "executableId": 25,
        "id": 79
      },
      {
        "mmdd": "0724",
        "sortKey": 1500915900,
        "timeStr": "12:05pm",
        "parentExecutableName": "Every 4 hours",
        "executableId": 25,
        "id": 79,
        "childExecutableName": "Goto 0, 0, 0 123"
      },
      {
        "mmdd": "0724",
        "sortKey": 1500930300,
        "timeStr": "04:05pm",
        "parentExecutableName": "Every 4 hours",
        "executableId": 25,
        "id": 79,
        "childExecutableName": "Goto 0, 0, 0 123"
      },
      {
        "mmdd": "0724",
        "sortKey": 1500922800,
        "timeStr": "02:00pm",
        "parentExecutableName": "Every 4 hours",
        "executableId": 25,
        "id": 79,
        "childExecutableName": "Goto 0, 0, 0 123"
      },
      {
        "mmdd": "0724",
        "sortKey": 1500944400,
        "timeStr": "08:00pm",
        "parentExecutableName": "Every 4 hours",
        "executableId": 25,
        "id": 79,
        "childExecutableName": "Goto 0, 0, 0 123"
      }
    ]
  },
  {
    "sortKey": 1501009200,
    "month": "Jul",
    "day": 25,
    "items": [
      {
        "mmdd": "0725",
        "sortKey": 1501009200,
        "timeStr": "02:00pm",
        "parentExecutableName": "Every 4 hours",
        "executableId": 25,
        "id": 79
      },
      {
        "mmdd": "0725",
        "sortKey": 1500959100,
        "timeStr": "12:05am",
        "parentExecutableName": "Every 4 hours",
        "executableId": 25,
        "id": 79,
        "childExecutableName": "Goto 0, 0, 0 123"
      },
      {
        "mmdd": "0725",
        "sortKey": 1500973500,
        "timeStr": "04:05am",
        "parentExecutableName": "Every 4 hours",
        "executableId": 25,
        "id": 79,
        "childExecutableName": "Goto 0, 0, 0 123"
      },
      {
        "mmdd": "0725",
        "sortKey": 1500987900,
        "timeStr": "08:05am",
        "parentExecutableName": "Every 4 hours",
        "executableId": 25,
        "id": 79,
        "childExecutableName": "Goto 0, 0, 0 123"
      },
      {
        "mmdd": "0725",
        "sortKey": 1501002300,
        "timeStr": "12:05pm",
        "parentExecutableName": "Every 4 hours",
        "executableId": 25,
        "id": 79,
        "childExecutableName": "Goto 0, 0, 0 123"
      },
      {
        "mmdd": "0725",
        "sortKey": 1501016700,
        "timeStr": "04:05pm",
        "parentExecutableName": "Every 4 hours",
        "executableId": 25,
        "id": 79,
        "childExecutableName": "Goto 0, 0, 0 123"
      },
      {
        "mmdd": "0725",
        "sortKey": 1501009200,
        "timeStr": "02:00pm",
        "parentExecutableName": "Every 4 hours",
        "executableId": 25,
        "id": 79,
        "childExecutableName": "Goto 0, 0, 0 123"
      },
      {
        "mmdd": "0725",
        "sortKey": 1501030800,
        "timeStr": "08:00pm",
        "parentExecutableName": "Every 4 hours",
        "executableId": 25,
        "id": 79,
        "childExecutableName": "Goto 0, 0, 0 123"
      }
    ]
  },
  {
    "sortKey": 1501095600,
    "month": "Jul",
    "day": 26,
    "items": [
      {
        "mmdd": "0726",
        "sortKey": 1501095600,
        "timeStr": "02:00pm",
        "parentExecutableName": "Every 4 hours",
        "executableId": 25,
        "id": 79
      },
      {
        "mmdd": "0726",
        "sortKey": 1501045500,
        "timeStr": "12:05am",
        "parentExecutableName": "Every 4 hours",
        "executableId": 25,
        "id": 79,
        "childExecutableName": "Goto 0, 0, 0 123"
      },
      {
        "mmdd": "0726",
        "sortKey": 1501059900,
        "timeStr": "04:05am",
        "parentExecutableName": "Every 4 hours",
        "executableId": 25,
        "id": 79,
        "childExecutableName": "Goto 0, 0, 0 123"
      },
      {
        "mmdd": "0726",
        "sortKey": 1501074300,
        "timeStr": "08:05am",
        "parentExecutableName": "Every 4 hours",
        "executableId": 25,
        "id": 79,
        "childExecutableName": "Goto 0, 0, 0 123"
      },
      {
        "mmdd": "0726",
        "sortKey": 1501088700,
        "timeStr": "12:05pm",
        "parentExecutableName": "Every 4 hours",
        "executableId": 25,
        "id": 79,
        "childExecutableName": "Goto 0, 0, 0 123"
      },
      {
        "mmdd": "0726",
        "sortKey": 1501103100,
        "timeStr": "04:05pm",
        "parentExecutableName": "Every 4 hours",
        "executableId": 25,
        "id": 79,
        "childExecutableName": "Goto 0, 0, 0 123"
      },
      {
        "mmdd": "0726",
        "sortKey": 1501095600,
        "timeStr": "02:00pm",
        "parentExecutableName": "Every 4 hours",
        "executableId": 25,
        "id": 79,
        "childExecutableName": "Goto 0, 0, 0 123"
      },
      {
        "mmdd": "0726",
        "sortKey": 1501117200,
        "timeStr": "08:00pm",
        "parentExecutableName": "Every 4 hours",
        "executableId": 25,
        "id": 79,
        "childExecutableName": "Goto 0, 0, 0 123"
      }
    ]
  }
];
