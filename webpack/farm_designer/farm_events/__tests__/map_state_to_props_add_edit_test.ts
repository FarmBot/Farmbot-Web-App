import { mapStateToPropsAddEdit } from "../map_state_to_props_add_edit";
import { fakeState } from "../../../__test_support__/fake_state";

describe("mapStateToPropsAddEdit()", () => {
  const {
    executableOptions,
    handleTime,
} = mapStateToPropsAddEdit(fakeState());

  it("handleTime(): start_time", () => {
    const e = {
      currentTarget: { value: "10:54", name: "start_time" }
    } as React.SyntheticEvent<HTMLInputElement>;
    const result = handleTime(e, "2017-05-21T22:00:00.000");
    expect(result).toContain("54");
  });

  it("handleTime(): end_time", () => {
    const e = {
      currentTarget: { value: "10:53", name: "end_time" }
    } as React.SyntheticEvent<HTMLInputElement>;
    const result = handleTime(e, "2017-05-21T22:00:00.000");
    expect(result).toContain("53");
  });

  it("executableOptions", () => {
    expect(executableOptions).toEqual(expect.arrayContaining([
      {
        headingId: "Regimen",
        label: expect.stringContaining("Regimen: "),
        value: expect.any(Number)
      },
      {
        headingId: "Sequence",
        label: expect.stringContaining("Sequence: "),
        value: expect.any(Number)
      }
    ]));
  });
});
