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
import { countBy } from "lodash";
import { TimeUnit } from "../../interfaces";

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

    const day1Time = moment(testTime).add(1, "day");
    const day1ItemTime = day1Time.add(2, "minutes");
    const day2Time = moment(testTime).add(2, "days");
    const regimenStartTime = day2Time.clone().add(1, "minutes");
    const regimenItemTime = day2Time.clone().add(10, "minutes");
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
            timeStr: day1ItemTime.utcOffset(0).format("hh:mma")
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
            timeStr: regimenStartTime.utcOffset(0).format("hh:mma")
          },
          {
            executableId: 1,
            heading: "Foo",
            id: 2,
            mmddyy: regimenItemTime.format("MMDDYY"),
            sortKey: regimenItemTime.unix(),
            subheading: "fake",
            timeStr: regimenItemTime.utcOffset(0).format("hh:mma")
          }],
        month: day2Time.format("MMM"),
        sortKey: regimenStartTime.unix(),
        year: day2Time.year() - 2000
      }]);

    expect(push).toBeTruthy();
  });
});

describe("mapResourcesToCalendar(): sequence farm events", () => {
  interface EventData {
    start_time: string;
    end_time: string;
    repeat?: number;
    time_unit?: TimeUnit;
  }

  function fakeSeqFEResources(props: EventData) {
    const sequence = fakeSequence();
    sequence.body.id = 1;
    sequence.body.body = [{ kind: "take_photo", args: {} }];

    const sequenceFarmEvent = fakeFarmEvent("Sequence", 1);
    sequenceFarmEvent.body.id = 1;
    sequenceFarmEvent.body.start_time = props.start_time;
    sequenceFarmEvent.body.end_time = props.end_time;
    sequenceFarmEvent.body.repeat = props.repeat || 1;
    sequenceFarmEvent.body.time_unit = props.time_unit || "never";

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

  it("returns calendar rows: single event", () => {
    const eventData: EventData = {
      start_time: "2017-12-20T01:02:00.000Z",
      end_time: "2017-12-20T01:05:00.000Z"
    };
    const testTime = moment("2017-12-15T01:00:00.000Z");
    const calendar = mapResourcesToCalendar(
      fakeSeqFEResources(eventData).index, testTime);
    expect(calendar.getAll()).toEqual(fakeSequenceFE);
  });

  it("returns calendar rows: hidden items", () => {
    const eventData: EventData = {
      start_time: "2017-12-20T01:02:00.000Z",
      end_time: "2017-12-20T04:05:00.000Z",
      repeat: 1,
      time_unit: "minutely"
    };
    const testTime = moment("2017-12-15T01:00:00.000Z");
    const calendar = mapResourcesToCalendar(
      fakeSeqFEResources(eventData).index, testTime);
    const dayOneItems = calendar.getAll()[0].items;
    expect(countBy(dayOneItems, "heading")).toEqual({
      "fake": 59,
      "+ 123 more: fake": 1
    });
  });

  it("returns calendar rows: empty", () => {
    const eventData: EventData = {
      start_time: "2017-12-20T01:02:00.000Z",
      end_time: "2019-12-20T01:05:00.000Z",
      repeat: 100,
      time_unit: "yearly"
    };
    const testTime = moment("2017-12-30T01:00:00.000Z");
    const calendar = mapResourcesToCalendar(
      fakeSeqFEResources(eventData).index, testTime);
    const dayOneItems = calendar.getAll()[0].items;
    expect(countBy(dayOneItems, "heading")).toEqual({ "*Empty*": 1 });
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

  fit("returns calendar rows", () => {
    const testTime = moment("2017-12-15T01:00:00.000Z");
    const calendar =
      mapResourcesToCalendar(fakeRegFEResources().index, testTime);
    expect(calendar.getAll()).toEqual(fakeRegimenFE);
  });

  fit("doesn't return calendar row after event is over", () => {
    const testTime = moment("2017-12-27T01:00:00.000Z");
    const calendar =
      mapResourcesToCalendar(fakeRegFEResources().index, testTime);
    expect(calendar.getAll()).toEqual([]);
  });
});
