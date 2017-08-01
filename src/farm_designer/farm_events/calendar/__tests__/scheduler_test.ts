import { scheduler, scheduleForFarmEvent, TimeLine, farmEventIntervalSeconds } from "../scheduler";
import * as moment from "moment";
import { TimeUnit } from "../../../interfaces";

describe("scheduler", () => {
  it("runs every 4 hours, starting Tu, until Th w/ origin of Mo", () => {
    // 8am Monday
    let monday = moment()
      .add(14, "days")
      .startOf("isoWeek")
      .startOf("day")
      .add(8, "hours");
    // 3am Tuesday
    let tuesday = monday.clone().add(19, "hours");
    // 18pm Thursday
    let thursday = monday.clone().add(3, "days").add(10, "hours");
    let interval = moment.duration(4, "hours").asSeconds();
    let result1 = scheduler({
      originTime: monday,
      intervalSeconds: interval,
      lowerBound: tuesday,
      upperBound: thursday
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

  it("handles UTC", () => {
    pending();
    let fakeEvent = {
      "start_time": "2017-08-01T17:30:00.000Z",
      "end_time": "2017-08-07T05:00:00.000Z",
      "repeat": 2,
      "time_unit": "daily",
    };
    let now = moment("2017-08-01T19:22:38.502Z");
    let intervalSeconds = farmEventIntervalSeconds(fakeEvent.repeat,
      fakeEvent.time_unit as TimeUnit);
    let result = scheduler({
      originTime: moment(fakeEvent.start_time),
      lowerBound: moment(fakeEvent.start_time),
      upperBound: moment(fakeEvent.end_time),
      intervalSeconds
    });

    const EXPECTED = [
      moment("2017-08-03T17:30:00.000Z"),
      moment("2017-08-05T17:30:00.000Z")
    ];

    expect(result.length).toEqual(2);
    EXPECTED.map((expectation, index) => {
      expect(expectation.isSame(result[index])).toBeTruthy();
    });
  });

  it("handles 0 as a repeat value? What happens?");
});

it("schedules a FarmEvent", () => {
  let fakeEvent: TimeLine = {
    "start_time": "2017-08-01T17:30:00.000Z",
    "end_time": "2017-08-07T05:00:00.000Z",
    "repeat": 2,
    "time_unit": "daily",
  };
  let now = moment("2017-08-01T19:22:38.502Z");
  const EXPECTED = [
    moment("2017-08-01T17:30:00.000Z"),
    moment("2017-08-03T17:30:00.000Z"),
    moment("2017-08-05T17:30:00.000Z")
  ];
  let result = scheduleForFarmEvent(fakeEvent);
  expect(result.length).toEqual(3);
  EXPECTED.map((expectation, index) => {
    expect(expectation.isSame(result[index])).toBeTruthy();
  });
});

describe("farmEventIntervalSeconds", () => {
  it("converts farm event intervals from misc. time units to seconds", () => {
    interface TestBarage {
      count: number;
      result: number;
      unit: TimeUnit;
    }

    let tests: TestBarage[] = [
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
