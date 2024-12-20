import { mapStateToPropsAddEdit } from "../map_state_to_props_add_edit";
import { fakeState } from "../../__test_support__/fake_state";
import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";
import {
  fakeSequence, fakeRegimen, fakeFarmEvent,
} from "../../__test_support__/fake_state/resources";
import { inputEvent } from "../../__test_support__/fake_html_events";
import { Path } from "../../internal_urls";

describe("mapStateToPropsAddEdit()", () => {

  describe("handleTime()", () => {
    const { handleTime } = mapStateToPropsAddEdit(fakeState());

    it("handles an element with name `start_time`", () => {
      const e = inputEvent("10:54", "start_time");
      const result = handleTime(e, "2017-05-21T22:00:00.000");
      expect(result).toContain("54");
    });

    it("handles an element with name `end_time`", () => {
      const e = inputEvent("10:53", "end_time");
      const result = handleTime(e, "2017-05-21T22:00:00.000");
      expect(result).toContain("53");
    });

    it("crashes on other names", () => {
      const e = inputEvent("10:52", "other");
      const boom = () => handleTime(e, "2017-05-21T22:00:00.000");
      expect(boom).toThrow("Expected a name attribute from time field.");
    });

    it("handles missing hours and minutes", () => {
      const e = inputEvent(":", "start_time");
      const result = handleTime(e, "2017-05-21T22:00:00.000");
      expect(result).toContain("00:00:00");
    });
  });

  describe("executableOptions()", () => {
    const state = fakeState();
    const s = fakeSequence();
    s.body.name = "Fake Sequence";
    s.body.id = 1;
    const r = fakeRegimen();
    r.body.name = "Fake Regimen";
    r.body.id = 1;
    state.resources = buildResourceIndex([s, r, fakeDevice()]);
    const { executableOptions } = mapStateToPropsAddEdit(state);

    it("returns executable list", () => {
      expect(executableOptions).toEqual(expect.arrayContaining([
        { headingId: "Regimen", label: "Fake Regimen", value: 1 },
        { headingId: "Sequence", label: "Fake Sequence", value: 1 },
      ]));
    });
  });

  describe("getFarmEvent()", () => {
    it("finds event", () => {
      const state = fakeState();
      const fe = fakeFarmEvent("Sequence", -1);
      state.resources = buildResourceIndex([fe, fakeDevice()]);
      location.pathname = Path.mock(Path.farmEvents(fe.body.id));
      const { getFarmEvent } = mapStateToPropsAddEdit(state);
      const navigate = jest.fn();
      expect(getFarmEvent(navigate)).toEqual(expect.objectContaining({
        kind: "FarmEvent",
        body: expect.objectContaining({ id: fe.body.id })
      }));
    });

    it("doesn't find event", () => {
      const state = fakeState();
      state.resources = buildResourceIndex([fakeDevice()]);
      location.pathname = Path.mock(Path.farmEvents(999));
      const { getFarmEvent } = mapStateToPropsAddEdit(state);
      const navigate = jest.fn();
      getFarmEvent(navigate);
      expect(navigate).toHaveBeenCalledWith(Path.farmEvents());
    });
  });

  describe("findExecutable()", () => {
    it("finds sequence", () => {
      const state = fakeState();
      const s = fakeSequence();
      s.body.id = 10;
      state.resources = buildResourceIndex([s, fakeDevice()]);
      const { findExecutable } = mapStateToPropsAddEdit(state);
      expect(findExecutable("Sequence", s.body.id)).toEqual(
        expect.objectContaining({
          kind: "Sequence",
          body: expect.objectContaining({ id: s.body.id })
        }));
    });

    it("finds regimen", () => {
      const state = fakeState();
      const r = fakeRegimen();
      r.body.id = 10;
      state.resources = buildResourceIndex([r, fakeDevice()]);
      const { findExecutable } = mapStateToPropsAddEdit(state);
      expect(findExecutable("Regimen", r.body.id)).toEqual(
        expect.objectContaining({
          kind: "Regimen",
          body: expect.objectContaining({ id: r.body.id })
        }));
    });
  });

  describe("findFarmEventByUuid()", () => {
    it("finds farm event", () => {
      const state = fakeState();
      const farmEvent = fakeFarmEvent("Sequence", 1);
      state.resources = buildResourceIndex([farmEvent, fakeDevice()]);
      const { findFarmEventByUuid } = mapStateToPropsAddEdit(state);
      const result = findFarmEventByUuid(farmEvent.uuid);
      expect(result).toEqual(farmEvent);
    });

    it("doesn't find farm event: no farm events", () => {
      const state = fakeState();
      state.resources = buildResourceIndex([fakeDevice()]);
      const { findFarmEventByUuid } = mapStateToPropsAddEdit(state);
      const result = findFarmEventByUuid("uuid");
      expect(result).toEqual(undefined);
    });

    it("doesn't find farm event: undefined uuid", () => {
      const state = fakeState();
      state.resources = buildResourceIndex([fakeDevice()]);
      const { findFarmEventByUuid } = mapStateToPropsAddEdit(state);
      const result = findFarmEventByUuid(undefined);
      expect(result).toEqual(undefined);
    });
  });
});
