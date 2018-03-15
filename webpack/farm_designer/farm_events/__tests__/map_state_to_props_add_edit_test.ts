import { mapStateToPropsAddEdit } from "../map_state_to_props_add_edit";
import { fakeState } from "../../../__test_support__/fake_state";
import { buildResourceIndex, fakeDevice } from "../../../__test_support__/resource_index_builder";
import { fakeSequence, fakeRegimen } from "../../../__test_support__/fake_state/resources";

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
});
