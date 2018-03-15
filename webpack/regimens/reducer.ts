import * as _ from "lodash";
import { Dictionary } from "farmbot";
import { Week, DAYS } from "./bulk_scheduler/interfaces";
import { generateReducer } from "../redux/generate_reducer";
import { TaggedResource, TaggedRegimen } from "../resources/tagged_resources";
import { Actions } from "../constants";

export interface RegimenState {
  dailyOffsetMs: number;
  weeks: Week[];
  selectedSequenceUUID?: string | undefined;
  currentRegimen?: string | undefined;
}

function newWeek() {
  return {
    days: {
      day1: false,
      day2: false,
      day3: false,
      day4: false,
      day5: false,
      day6: false,
      day7: false
    }
  };
}

function newState(): RegimenState {
  return {
    dailyOffsetMs: 300000,
    weeks: _.times(10, newWeek),
    selectedSequenceUUID: undefined,
    currentRegimen: undefined
  };
}

export let initialState: RegimenState = newState();

export let regimensReducer = generateReducer<RegimenState>(initialState)
  .add<TaggedResource>(Actions.DESTROY_RESOURCE_OK, (s, { payload }) => {
    switch (payload.uuid) {
      case s.selectedSequenceUUID:
      case s.currentRegimen:
        s.selectedSequenceUUID = undefined;
        break;
    }
    return s;
  })
  .add<TaggedResource>(Actions.INIT_RESOURCE, (s, { payload }) => {
    if (payload.kind === "Regimen") {
      s.currentRegimen = payload.uuid;
    }
    return s;
  })
  .add<void>(Actions.PUSH_WEEK, (s) => {
    s.weeks.push(newWeek());
    return s;
  })
  .add<void>(Actions.POP_WEEK, (s) => {
    s.weeks.pop();
    return s;
  })
  .add<void>(Actions.DESELECT_ALL_DAYS, (s) => {
    s.weeks.map((week) => DAYS.map((key) => week.days[key] = false));
    return s;
  })
  .add<void>(Actions.SELECT_ALL_DAYS, (s) => {
    s.weeks.map((week) => DAYS.map((key) => week.days[key] = true));
    return s;
  })
  .add<{ week: number, day: number }>(Actions.TOGGLE_DAY, (s, { payload }) => {
    const week = s.weeks[payload.week];
    const day = `day${payload.day}`;
    const days = (week.days as Dictionary<boolean>);
    days[day] = !days[day];
    return s;
  })
  .add<TaggedRegimen>(Actions.SELECT_REGIMEN, (s, { payload }) => {
    s.currentRegimen = payload.uuid;
    return s;
  })
  .add<string>(Actions.SET_SEQUENCE, (s, { payload }) => {
    s.selectedSequenceUUID = payload;
    return s;
  })
  .add<number>(Actions.SET_TIME_OFFSET, (s, { payload }) => {
    s.dailyOffsetMs = payload;
    return s;
  });
