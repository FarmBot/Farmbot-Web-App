import {
  scheduler,
  scheduleForFarmEvent,
  TimeLine,
  farmEventIntervalSeconds,
  maxDisplayItems,
  gracePeriodSeconds
} from "../scheduler";
import * as moment from "moment";
import { TimeUnit } from "../../../interfaces";
import { Moment } from "moment";
import { range, padStart } from "lodash";

describe("scheduler", () => {
  it("runs every 4 hours, starting Tu, until Th w/ origin of Mo", () => {
    // 8am Monday
    const monday = moment()
      .add(14, "days")
      .startOf("isoWeek")
      .startOf("day")
      .add(8, "hours");
    // 4am Tuesday
    const tuesday = monday.clone().add(20, "hours");
    // 18pm Thursday
    const thursday = monday.clone().add(3, "days").add(10, "hours");
    const interval = moment.duration(4, "hours").asSeconds();
    const result1 = scheduler({
      currentTime: monday,
      intervalSeconds: interval,
      startTime: tuesday,
      endTime: thursday
    });
    expect(result1[0].format("dd")).toEqual("Tu");
    expect(result1[0].hour()).toEqual(4);
    expect(result1.length).toEqual(16);
    const EXPECTED = [
      "04:00am Tu",
      "08:00am Tu",
      "12:00pm Tu",
      "04:00pm Tu",
      "08:00pm Tu",
      "12:00am We",
      "04:00am We",
      "08:00am We",
      "12:00pm We",
      "04:00pm We",
      "08:00pm We",
      "12:00am Th",
      "04:00am Th",
      "08:00am Th",
      "12:00pm Th",
      "04:00pm Th"
    ];
    const REALITY = result1.map(x => x.format("hh:mma dd"));
    EXPECTED.map(x => expect(REALITY).toContain(x));
  });

  function testSchedule(
    description: string,
    fakeEvent: TimeLine,
    timeNow: Moment,
    expected: Moment[]) {
    it(description, () => {
      const result = scheduleForFarmEvent(fakeEvent, timeNow);
      expect(result.length).toEqual(expected.length);
      expected.map((expectation, index) => {
        expect(result[index]).toBeSameTimeAs(expectation);
      });
    });
  }

  const singleFarmEvent: TimeLine = {
    "start_time": "2017-08-01T17:00:00.000Z",
    "end_time": "2017-08-01T18:00:00.000Z",
    "repeat": 1,
    "time_unit": "never"
  };

  testSchedule("schedules a FarmEvent",
    {
      "start_time": "2017-08-01T17:30:00.000Z",
      "end_time": "2017-08-07T05:00:00.000Z",
      "repeat": 2,
      "time_unit": "daily"
    },
    moment("2017-08-01T16:30:00.000Z"),
    [
      moment("2017-08-01T17:30:00.000Z"),
      moment("2017-08-03T17:30:00.000Z"),
      moment("2017-08-05T17:30:00.000Z")
    ]);

  testSchedule("handles 0 as a repeat value",
    {
      "start_time": "2017-08-01T17:30:00.000Z",
      "end_time": "2017-08-07T05:00:00.000Z",
      "repeat": 0,
      "time_unit": "daily"
    },
    moment("2017-08-01T16:30:00.000Z"),
    [moment("2017-08-01T17:30:00.000Z")]);

  testSchedule("handles start_time in the past",
    {
      "start_time": "2017-08-01T17:30:00.000Z",
      "end_time": "2017-08-09T05:00:00.000Z",
      "repeat": 2,
      "time_unit": "daily"
    },
    moment("2017-08-03T18:30:00.000Z"),
    [
      moment("2017-08-05T17:30:00.000Z"),
      moment("2017-08-07T17:30:00.000Z")
    ]);

  testSchedule("handles start_time in the past: no repeat",
    singleFarmEvent,
    moment("2017-08-01T17:30:00.000Z"),
    [moment("2017-08-01T17:00:00.000Z")]);

  testSchedule(`uses grace period (${gracePeriodSeconds}s)`,
    {
      "start_time": "2017-08-01T17:30:00.000Z",
      "end_time": "2017-08-02T05:00:00.000Z",
      "repeat": 4,
      "time_unit": "hourly"
    },
    moment("2017-08-01T17:30:00.000Z").add(gracePeriodSeconds / 2, "seconds"),
    [
      moment("2017-08-01T17:30:00.000Z"),
      moment("2017-08-01T21:30:00.000Z"),
      moment("2017-08-02T01:30:00.000Z")
    ]);

  testSchedule(`uses grace period (${gracePeriodSeconds}s): no repeat`,
    singleFarmEvent,
    moment("2017-08-01T17:00:00.000Z").add(gracePeriodSeconds / 2, "seconds"),
    [moment("2017-08-01T17:00:00.000Z")]);

  testSchedule("farm event over",
    {
      "start_time": "2017-08-01T17:30:00.000Z",
      "end_time": "2017-08-02T05:00:00.000Z",
      "repeat": 4,
      "time_unit": "hourly"
    },
    moment("2017-08-03T17:30:30.000Z"),
    []);

  testSchedule("farm event over: no repeat",
    singleFarmEvent,
    moment("2017-08-01T19:00:00.000Z"),
    []);

  testSchedule(`first ${maxDisplayItems} items`,
    {
      "start_time": "2017-08-02T17:00:00.000Z",
      "end_time": "2017-08-02T19:00:00.000Z",
      "repeat": 1,
      "time_unit": "minutely"
    },
    moment("2017-08-01T15:30:00.000Z"),
    range(0, maxDisplayItems)
      .map((x: number) =>
        moment(`2017-08-02T17:${padStart("" + x, 2, "0")}:00.000Z`)));

  testSchedule(`only ${maxDisplayItems} items`,
    {
      "start_time": "2017-08-02T16:00:00.000Z",
      "end_time": "2017-08-02T21:00:00.000Z",
      "repeat": 1,
      "time_unit": "minutely"
    },
    moment("2017-08-02T17:00:00.000Z").add(gracePeriodSeconds, "seconds"),
    range(0, maxDisplayItems)
      .map((x: number) =>
        moment(`2017-08-02T17:${padStart("" + x, 2, "0")}:00.000Z`)));

  testSchedule("item at end time is not rendered",
    {
      "start_time": "2017-08-01T17:30:00.000Z",
      "end_time": "2017-08-02T01:30:00.000Z",
      "repeat": 4,
      "time_unit": "hourly"
    },
    moment("2017-08-01T16:30:00.000Z"),
    [
      moment("2017-08-01T17:30:00.000Z"),
      moment("2017-08-01T21:30:00.000Z")
    ]);

  testSchedule(`renders item at grace period (${gracePeriodSeconds}s) cutoff`,
    {
      "start_time": "2017-08-01T17:30:00.000Z",
      "end_time": "2017-08-02T01:30:00.000Z",
      "repeat": 4,
      "time_unit": "hourly"
    },
    moment("2017-08-01T17:30:00.000Z").add(gracePeriodSeconds, "seconds"),
    [
      moment("2017-08-01T17:30:00.000Z"),
      moment("2017-08-01T21:30:00.000Z")
    ]);
});

describe("farmEventIntervalSeconds", () => {
  it("converts farm event intervals from misc. time units to seconds", () => {
    interface TestBarage {
      count: number;
      result: number;
      unit: TimeUnit;
    }

    const tests: TestBarage[] = [
      { count: 9, unit: "daily", result: 777600 },
      { count: 8, unit: "hourly", result: 28800 },
      { count: 1, unit: "daily", result: 86400 },
      { count: 0, unit: "yearly", result: 0 },
      { count: 2, unit: "weekly", result: 1209600 },
      { count: 4, unit: "minutely", result: 240 },
      { count: 3, unit: "never", result: 0 }
    ];

    tests.forEach((T) => {
      expect(farmEventIntervalSeconds(T.count, T.unit)).toEqual(T.result);
    });
  });
});
