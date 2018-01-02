import { mapStateToProps, mapResourcesToCalendar } from "../map_state_to_props";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  fakeSequence,
  fakeRegimen,
  fakeFarmEvent
} from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex
} from "../../../__test_support__/resource_index_builder";
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
        // tslint:disable-next-line:no-any
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

    const day1Time = moment(testTime).utcOffset(0).add(1, "day");
    const day1ItemTime = day1Time.utcOffset(0).add(2, "minutes");
    const day2Time = moment(testTime).utcOffset(0).add(2, "days");
    const regimenStartTime = day2Time.clone().utcOffset(0).add(1, "minutes");
    const regimenItemTime = day2Time.clone().utcOffset(0).add(10, "minutes");
    expect(calendarRows).toEqual([
      {
        day: day1Time.date(),
        items: [
          {
            executableId: 1,
            heading: "fake",
            id: 1,
            mmddyy: day1ItemTime.format("MMDDYY"),
            sortKey: day1ItemTime.unix(),
            timeStr: day1ItemTime.format("hh:mma")
          }],
        month: day1Time.format("MMM"),
        sortKey: day1Time.unix(),
        year: day1Time.year() - 2000
      },
      {
        day: day2Time.date(),
        items: [
          {
            executableId: 1,
            heading: "Foo",
            id: 2,
            mmddyy: regimenStartTime.format("MMDDYY"),
            sortKey: regimenStartTime.unix(),
            subheading: "",
            timeStr: regimenStartTime.format("hh:mma")
          },
          {
            executableId: 1,
            heading: "Foo",
            id: 2,
            mmddyy: regimenItemTime.format("MMDDYY"),
            sortKey: regimenItemTime.unix(),
            subheading: "fake",
            timeStr: regimenItemTime.format("hh:mma")
          }],
        month: day2Time.format("MMM"),
        sortKey: regimenStartTime.unix(),
        year: day2Time.year() - 2000
      }]);

    expect(push).toBeTruthy();
  });
});

describe("mapResourcesToCalendar(): sequence farm events", () => {
  function fakeSeqFEResources() {
    const sequence = fakeSequence();
    sequence.body.id = 1;
    sequence.body.body = [{ kind: "take_photo", args: {} }];

    const sequenceFarmEvent = fakeFarmEvent("Sequence", 1);
    sequenceFarmEvent.body.id = 1;
    sequenceFarmEvent.body.start_time = "2017-12-20T01:02:00.000Z";
    sequenceFarmEvent.body.end_time = "2017-12-20T01:05:00.000Z";

    return buildResourceIndex([sequence, sequenceFarmEvent]);
  }

  const fakeSequenceFE = [{
    day: expect.any(Number),
    items: [{
      executableId: 1,
      heading: "fake",
      id: 1,
      mmddyy: expect.stringContaining("17"),
      sortKey: expect.any(Number),
      timeStr: expect.stringContaining("02")
    }],
    month: "Dec",
    sortKey: expect.any(Number),
    year: 17
  }];

  it("returns calendar rows", () => {
    const testTime = moment("2017-12-15T01:00:00.000Z");
    const calendar = mapResourcesToCalendar(
      fakeSeqFEResources().index, testTime);
    expect(calendar.getAll()).toEqual(fakeSequenceFE);
  });
});

describe("mapResourcesToCalendar(): regimen farm events", () => {
  function fakeRegFEResources() {
    const sequence = fakeSequence();
    sequence.body.id = 1;
    sequence.body.body = [{ kind: "take_photo", args: {} }];

    const regimen = fakeRegimen();
    regimen.body.id = 1;
    regimen.body.regimen_items = [{
      sequence_id: 1,
      time_offset: 288660000
    }];

    const regimenFarmEvent = fakeFarmEvent("Regimen", 1);
    regimenFarmEvent.body.id = 2;
    regimenFarmEvent.body.start_time = "2017-12-20T01:02:00.000Z";
    regimenFarmEvent.body.end_time = "2017-12-20T01:05:00.000Z";

    return buildResourceIndex([sequence, regimen, regimenFarmEvent]);
  }

  const fakeRegimenFE = [{
    day: expect.any(Number),
    items: [
      {
        executableId: 1,
        heading: "Foo",
        subheading: "",
        id: 2,
        mmddyy: expect.stringContaining("17"),
        sortKey: expect.any(Number),
        timeStr: expect.stringContaining("02")
      }
    ],
    month: "Dec",
    sortKey: expect.any(Number),
    year: 17
  },
  {
    day: expect.any(Number),
    items: [
      {
        executableId: 1,
        heading: "Foo",
        subheading: "fake",
        id: 2,
        mmddyy: expect.stringContaining("17"),
        sortKey: expect.any(Number),
        timeStr: expect.stringContaining("11")
      }
    ],
    month: "Dec",
    sortKey: expect.any(Number),
    year: 17
  }
  ];

  it("returns calendar rows", () => {
    const testTime = moment("2017-12-15T01:00:00.000Z");
    const calendar = mapResourcesToCalendar(
      fakeRegFEResources().index, testTime);
    expect(calendar.getAll()).toEqual(fakeRegimenFE);
  });

  it("doesn't return calendar row after event is over", () => {
    const testTime = moment("2017-12-27T01:00:00.000Z");
    const calendar = mapResourcesToCalendar(
      fakeRegFEResources().index, testTime);
    expect(calendar.getAll()).toEqual([]);
  });
});
