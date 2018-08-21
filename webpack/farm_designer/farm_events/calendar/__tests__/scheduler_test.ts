import {
  scheduler,
  scheduleForFarmEvent,
  TimeLine,
  farmEventIntervalSeconds,
  maxDisplayItems,
  gracePeriodSeconds
} from "../scheduler";
import * as moment from "moment";
import { Moment } from "moment";
import { range, padStart } from "lodash";
import { TimeUnit } from "farmbot/dist/resources/api_resources";

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
    expect(result1.items[0].format("dd")).toEqual("Tu");
    expect(result1.items[0].hour()).toEqual(4);
    expect(result1.items.length).toEqual(16);
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
    const REALITY = result1.items.map(x => x.format("hh:mma dd"));
    EXPECTED.map(x => expect(REALITY).toContain(x));
  });
});

describe("scheduleForFarmEvent", () => {
  interface TestScheduleProps {
    description: string;
    fakeEvent: TimeLine;
    timeNow: Moment;
    expected: Moment[];
    shortenedBy: number;
  }

  function testSchedule(props: TestScheduleProps) {
    const { description, fakeEvent, timeNow, expected, shortenedBy } = props;
    it(description, () => {
      const result = scheduleForFarmEvent(fakeEvent, timeNow);
      expect(result.items.length).toEqual(expected.length);
      expected.map((expectation, index) => {
        expect(result.items[index]).toBeSameTimeAs(expectation);
      });
      expect(result.shortenedBy).toEqual(shortenedBy);
    });
  }

  const singleFarmEvent: TimeLine = {
    start_time: "2017-08-01T17:00:00.000Z",
    end_time: "2017-08-01T18:00:00.000Z",
    repeat: 1,
    time_unit: "never"
  };

  const scheduleTestData: TestScheduleProps[] = [
    {
      description: "schedules a FarmEvent",
      fakeEvent: {
        start_time: "2017-08-01T17:30:00.000Z",
        end_time: "2017-08-07T05:00:00.000Z",
        repeat: 2,
        time_unit: "daily"
      },
      timeNow: moment("2017-08-01T16:30:00.000Z"),
      expected: [
        moment("2017-08-01T17:30:00.000Z"),
        moment("2017-08-03T17:30:00.000Z"),
        moment("2017-08-05T17:30:00.000Z")
      ],
      shortenedBy: 0
    },
    {
      description: "handles 0 as a repeat value",
      fakeEvent: {
        start_time: "2017-08-01T17:30:00.000Z",
        end_time: "2017-08-07T05:00:00.000Z",
        repeat: 0,
        time_unit: "daily"
      },
      timeNow: moment("2017-08-01T16:30:00.000Z"),
      expected: [moment("2017-08-01T17:30:00.000Z")],
      shortenedBy: 0
    },
    {
      description: "handles start_time in the past",
      fakeEvent: {
        start_time: "2017-08-01T17:30:00.000Z",
        end_time: "2017-08-09T05:00:00.000Z",
        repeat: 2,
        time_unit: "daily"
      },
      timeNow: moment("2017-08-03T18:30:00.000Z"),
      expected: [
        moment("2017-08-05T17:30:00.000Z"),
        moment("2017-08-07T17:30:00.000Z")
      ],
      shortenedBy: 0
    },
    {
      description: "handles start_time in the past: no repeat",
      fakeEvent: singleFarmEvent,
      timeNow: moment("2017-08-01T17:30:00.000Z"),
      expected: [moment("2017-08-01T17:00:00.000Z")],
      shortenedBy: 0
    },
    {
      description: `uses grace period (${gracePeriodSeconds}s)`,
      fakeEvent: {
        start_time: "2017-08-01T17:30:00.000Z",
        end_time: "2017-08-02T05:00:00.000Z",
        repeat: 4,
        time_unit: "hourly"
      },
      timeNow: moment("2017-08-01T17:30:00.000Z")
        .add(gracePeriodSeconds / 2, "seconds"),
      expected: [
        moment("2017-08-01T17:30:00.000Z"),
        moment("2017-08-01T21:30:00.000Z"),
        moment("2017-08-02T01:30:00.000Z")
      ],
      shortenedBy: 0
    },
    {
      description: `uses grace period (${gracePeriodSeconds}s): no repeat`,
      fakeEvent: singleFarmEvent,
      timeNow: moment("2017-08-01T17:00:00.000Z")
        .add(gracePeriodSeconds / 2, "seconds"),
      expected: [moment("2017-08-01T17:00:00.000Z")],
      shortenedBy: 0
    },
    {
      description: "farm event over",
      fakeEvent: {
        start_time: "2017-08-01T17:30:00.000Z",
        end_time: "2017-08-02T05:00:00.000Z",
        repeat: 4,
        time_unit: "hourly"
      },
      timeNow: moment("2017-08-03T17:30:30.000Z"),
      expected: [],
      shortenedBy: 0
    },
    {
      description: "farm event over: no repeat",
      fakeEvent: singleFarmEvent,
      timeNow: moment("2017-08-01T19:00:00.000Z"),
      expected: [],
      shortenedBy: 0
    },
    {
      description: `first ${maxDisplayItems} items`,
      fakeEvent: {
        start_time: "2017-08-02T17:00:00.000Z",
        end_time: "2017-08-02T19:00:00.000Z",
        repeat: 1,
        time_unit: "minutely"
      },
      timeNow: moment("2017-08-01T15:30:00.000Z"),
      expected: range(0, maxDisplayItems)
        .map((x: number) =>
          moment(`2017-08-02T17:${padStart("" + x, 2, "0")}:00.000Z`)),
      shortenedBy: 120 - maxDisplayItems
    },
    {
      description: `only ${maxDisplayItems} items`,
      fakeEvent: {
        start_time: "2017-08-02T16:00:00.000Z",
        end_time: "2017-08-02T21:00:00.000Z",
        repeat: 1,
        time_unit: "minutely"
      },
      timeNow: moment("2017-08-02T17:00:00.000Z")
        .add(gracePeriodSeconds, "seconds"),
      expected: range(0, maxDisplayItems)
        .map((x: number) =>
          moment(`2017-08-02T17:${padStart("" + x, 2, "0")}:00.000Z`)),
      shortenedBy: 240 - maxDisplayItems
    },
    {
      description: "item at end time is not rendered",
      fakeEvent: {
        start_time: "2017-08-01T17:30:00.000Z",
        end_time: "2017-08-02T01:30:00.000Z",
        repeat: 4,
        time_unit: "hourly"
      },
      timeNow: moment("2017-08-01T16:30:00.000Z"),
      expected: [
        moment("2017-08-01T17:30:00.000Z"),
        moment("2017-08-01T21:30:00.000Z")
      ],
      shortenedBy: 0
    },
    {
      description: `shows item at grace period (${gracePeriodSeconds}s) cutoff`,
      fakeEvent: {
        start_time: "2017-08-01T17:30:00.000Z",
        end_time: "2017-08-02T01:30:00.000Z",
        repeat: 4,
        time_unit: "hourly"
      },
      timeNow: moment("2017-08-01T17:30:00.000Z")
        .add(gracePeriodSeconds, "seconds"),
      expected: [
        moment("2017-08-01T17:30:00.000Z"),
        moment("2017-08-01T21:30:00.000Z")
      ],
      shortenedBy: 0
    },
  ];

  scheduleTestData.map(testCaseData => testSchedule(testCaseData));
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
