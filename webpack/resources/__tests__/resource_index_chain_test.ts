import { createVariableNameLookup } from "../reducer_support";

describe("variableLookupTable", () => {
  it("creates variable meta data", () => {
    const result = createVariableNameLookup({}, {
      kind: "parameter_declaration",
      args: { label: "parent", data_type: "Point" }
    });
    expect(result).toBeDefined();
    expect(result.parent).toBeDefined();
    expect(result.parent.label).toEqual("parent");
  });
});
