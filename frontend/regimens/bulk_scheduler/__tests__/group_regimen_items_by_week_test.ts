import { groupRegimenItemsByWeek } from "../group_regimen_items_by_week";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { newWeek } from "../../reducer";

describe("groupRegimenItemsByWeek()", () => {
  it("groups regimen items by week", () => {
    const sequence = fakeSequence();
    sequence.body.id = 1;
    const week1 = newWeek();
    week1.days.day1 = true;
    const week2 = newWeek();
    const week3 = newWeek();
    week3.days.day2 = true;
    week3.days.day4 = true;
    const { day1, day2, day3, day4, day5, day6, day7 } = week3.days;
    week3.days = { day1, day4, day3, day2, day5, day6, day7 };
    const weeks = [week1, week2, week3];
    const result = groupRegimenItemsByWeek(weeks, 100, sequence.body);
    expect(result).toEqual([
      { time_offset: 100, sequence_id: 1 },
      { time_offset: 1296000100, sequence_id: 1 },
      { time_offset: 1468800100, sequence_id: 1 },
    ]);
  });

  it("handles missing sequence id", () => {
    const sequence = fakeSequence();
    sequence.body.id = undefined;
    const week = newWeek();
    week.days.day1 = true;
    const result = groupRegimenItemsByWeek([week], 0, sequence.body);
    expect(result).toEqual([
      { time_offset: 0, sequence_id: -1 },
    ]);
  });
});
