import { occurrence } from "../occurrence";
import moment from "moment";
import {
  TIME,
  fakeFarmEventWithExecutable,
} from "../../../__test_support__/farm_event_calendar_support";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { ParameterDeclaration } from "farmbot";

describe("occurrence", () => {
  it("builds a single entry for the calendar", () => {
    const fe = fakeFarmEventWithExecutable();
    const t = occurrence(TIME.MONDAY, fe, fakeTimeSettings(),
      buildResourceIndex([]).index);
    expect(t.executableId).toBe(fe.executable_id);
    expect(t.mmddyy).toBe("061917");
    expect(t.sortKey).toBe(moment(TIME.MONDAY).unix());
    expect(t.heading).toBe(fe.executable.name);
    expect(t.id).toBe(fe.id);
  });

  it("builds an entry for the calendar with variables", () => {
    const fe = fakeFarmEventWithExecutable();
    fe.body = [{
      kind: "parameter_application",
      args: {
        label: "label",
        data_value: { kind: "coordinate", args: { x: 1, y: 0, z: 0 } }
      }
    }];
    const parameterDeclaration: ParameterDeclaration = {
      kind: "parameter_declaration",
      args: {
        label: "label",
        default_value: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } }
      }
    };
    fe.executable_type == "Sequence" &&
      (fe.executable.args.locals.body = [parameterDeclaration]);
    const t = occurrence(TIME.MONDAY, fe, fakeTimeSettings(),
      buildResourceIndex([]).index);
    expect(t.variables).toEqual(["label - Coordinate (1, 0, 0)"]);
  });

  it("can't find variable", () => {
    const fe = fakeFarmEventWithExecutable();
    fe.body = undefined;
    const parameterDeclaration: ParameterDeclaration = {
      kind: "parameter_declaration",
      args: {
        label: "label",
        default_value: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } }
      }
    };
    fe.executable_type == "Sequence" &&
      (fe.executable.args.locals.body = [parameterDeclaration]);
    const t = occurrence(TIME.MONDAY, fe, fakeTimeSettings(),
      buildResourceIndex([]).index);
    expect(t.variables).toEqual(["label - Coordinate (0, 0, 0)"]);
  });

  it("builds entry with modified heading: hidden items", () => {
    const fe = fakeFarmEventWithExecutable();
    fe.executable.name = "Fake Sequence";
    const t = occurrence(TIME.MONDAY, fe, fakeTimeSettings(),
      buildResourceIndex([]).index, { numHidden: 10 });
    expect(t.heading).toBe("+ 10 more: Fake Sequence");
  });

  it("builds entry with modified heading: no items", () => {
    const fe = fakeFarmEventWithExecutable();
    const t = occurrence(TIME.MONDAY, fe, fakeTimeSettings(),
      buildResourceIndex([]).index, { empty: true });
    expect(t.heading).toBe("*Empty*");
  });
});
