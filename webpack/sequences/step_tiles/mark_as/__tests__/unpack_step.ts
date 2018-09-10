import { unpackStep, InputData } from "../unpack_step";
import { fakeResourceIndex } from "../../tile_move_absolute/test_helpers";

describe("unpackStep()", () => {
  it("unpacks unknown resource_update steps", () => {
    const params: InputData = {
      step: {
        kind: "resource_update",
        args: {
          resource_type: "Other",
          resource_id: 1,
          label: "some_attr",
          value: "some_value",
        }
      },
      resourceIndex: fakeResourceIndex()
    };
    const result = unpackStep(params);
    expect(result.action.label).toBe("some_attr = some_value");
    expect(result.action.value).toBe("some_value");
    expect(result.resource.label).toBe("Other");
    expect(result.resource.value).toBe(1);
  });
});
