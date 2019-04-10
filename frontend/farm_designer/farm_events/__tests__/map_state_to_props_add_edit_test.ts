let mockPath = "";
jest.mock("../../../history", () => ({
  getPathArray: jest.fn(() => { return mockPath.split("/"); }),
  history: {
    push: jest.fn()
  }
}));

import { mapStateToPropsAddEdit } from "../map_state_to_props_add_edit";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  buildResourceIndex, fakeDevice
} from "../../../__test_support__/resource_index_builder";
import {
  fakeSequence, fakeRegimen, fakeFarmEvent
} from "../../../__test_support__/fake_state/resources";
import { history } from "../../../history";

describe("mapStateToPropsAddEdit()", () => {

  describe("handleTime()", () => {
    const { handleTime } = mapStateToPropsAddEdit(fakeState());

    it("start_time", () => {
      const e = {
        currentTarget: { value: "10:54", name: "start_time" }
      } as React.SyntheticEvent<HTMLInputElement>;
      const result = handleTime(e, "2017-05-21T22:00:00.000");
      expect(result).toContain("54");
    });

    it("end_time", () => {
      const e = {
        currentTarget: { value: "10:53", name: "end_time" }
      } as React.SyntheticEvent<HTMLInputElement>;
      const result = handleTime(e, "2017-05-21T22:00:00.000");
      expect(result).toContain("53");
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
        { headingId: "Sequence", label: "Fake Sequence", value: 1 }
      ]));
    });
  });

  describe("getFarmEvent()", () => {
    it("finds event", () => {
      const state = fakeState();
      const fe = fakeFarmEvent("Sequence", -1);
      state.resources = buildResourceIndex([fe, fakeDevice()]);
      mockPath = "/app/designer/events/" + fe.body.id;
      const { getFarmEvent } = mapStateToPropsAddEdit(state);
      expect(getFarmEvent()).toEqual(expect.objectContaining({
        kind: "FarmEvent",
        body: expect.objectContaining({ id: fe.body.id })
      }));
    });

    it("doesn't find event", () => {
      const state = fakeState();
      state.resources = buildResourceIndex([fakeDevice()]);
      mockPath = "/app/designer/events/999";
      const { getFarmEvent } = mapStateToPropsAddEdit(state);
      getFarmEvent();
      expect(history.push).toHaveBeenCalledWith("/app/designer/events");
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
});
