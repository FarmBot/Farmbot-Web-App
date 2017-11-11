import { mapStateToProps } from "../map_state_to_props";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  fakeSequence,
  fakeRegimen,
  fakeFarmEvent
} from "../../../__test_support__/fake_state/resources";
import { buildResourceIndex } from "../../../__test_support__/resource_index_builder";
import * as moment from "moment";

describe("mapStateToProps()", () => {
  function testState(time: number) {
    const sequence = fakeSequence();
    sequence.body.id = 1;
    sequence.body.body = [{ kind: "take_photo", args: {} }];
    const regimen = fakeRegimen();
    regimen.body.id = 1;
    regimen.body.regimen_items = [{
      sequence_id: 1,
      time_offset: moment(time).add(10, "minutes")
        .diff(moment(time).clone().startOf("day"), "milliseconds")
    }];

    const getFutureTime =
      (t: number, value: number, label: string) =>
        moment(t).add(value as any, label).toISOString();

    const sequenceFarmEvent = fakeFarmEvent("Sequence", 1);
    sequenceFarmEvent.body.id = 1;
    const plusOneDay = moment(getFutureTime(time, 1, "day")).valueOf();
    sequenceFarmEvent.body.start_time = getFutureTime(plusOneDay, 2, "minutes");
    sequenceFarmEvent.body.end_time = getFutureTime(plusOneDay, 3, "minutes");

    const regimenFarmEvent = fakeFarmEvent("Regimen", 1);
    regimenFarmEvent.body.id = 2;
    const plusTwoDays = moment(getFutureTime(time, 2, "days")).valueOf();
    regimenFarmEvent.body.start_time = getFutureTime(plusTwoDays, 1, "minute");
    regimenFarmEvent.body.end_time = getFutureTime(plusTwoDays, 2, "minutes");

    const fakeResources = [
      sequence,
      regimen,
      sequenceFarmEvent,
      regimenFarmEvent
    ];

    const state = fakeState();
    state.resources = buildResourceIndex(fakeResources);
    return state;
  }

  it("returns calendar rows", () => {
    const testTime = moment().startOf("hour").valueOf();
    const { calendarRows, push } = mapStateToProps(testState(testTime));

    // Day 1: Sequence Farm Event
    const day1 = calendarRows[0];
    const day1Time = moment(testTime).add(1, "day");
    expect(day1.year).toEqual(day1Time.year() - 2000);
    expect(day1.month).toEqual(day1Time.format("MMM"));
    expect(day1.day).toEqual(day1Time.date());
    const day1ItemTime = day1Time.add(2, "minutes");
    expect(day1.sortKey).toEqual(day1ItemTime.unix());
    expect(day1.items).toEqual([{
      executableId: 1,
      heading: "fake",
      id: 1,
      mmddyy: day1ItemTime.format("MMDDYY"),
      sortKey: day1ItemTime.unix(),
      timeStr: day1ItemTime.format("hh:mma")
    }]);

    // Day 2: Regimen Farm Event
    const day2 = calendarRows[1];
    const day2Time = moment(testTime).add(2, "days");
    expect(day2.year).toEqual(day2Time.year() - 2000);
    expect(day2.month).toEqual(day2Time.format("MMM"));
    expect(day2.day).toEqual(day2Time.date());

    // Regimen
    const regimenStartTime = day2Time.clone().add(1, "minutes");
    expect(day2.sortKey).toEqual(regimenStartTime.unix());
    expect(day2.items[0]).toEqual({
      executableId: 1,
      heading: "Foo",
      id: 2,
      mmddyy: regimenStartTime.format("MMDDYY"),
      sortKey: regimenStartTime.unix(),
      subheading: "",
      timeStr: regimenStartTime.format("hh:mma")
    });

    // Regimen Item
    const regimenItemTime = day2Time.clone().add(10, "minutes");
    expect(day2.items[1]).toEqual({
      executableId: 1,
      heading: "Foo",
      id: 2,
      mmddyy: regimenItemTime.format("MMDDYY"),
      sortKey: regimenItemTime.unix(),
      subheading: "fake",
      timeStr: regimenItemTime.format("hh:mma")
    });

    expect(push).toBeTruthy();
  });
});
