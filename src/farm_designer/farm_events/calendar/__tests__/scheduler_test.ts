import { scheduler } from "../scheduler";
import * as moment from "moment";

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

  it("handles 0 as a repeat value? What happens?");
});
