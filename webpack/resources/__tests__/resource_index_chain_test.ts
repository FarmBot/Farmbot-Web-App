import { lookupReducer } from "../resource_index_chain";

describe("variableLookupTable", () => {
  it("creates variable meta data", () => {
    // Bare minimum example. CC: @gabrielBurnworth
    const result = lookupReducer({}, {
      kind: "parameter_declaration",
      args: {
        label: "parent",
        data_type: "Point"
      }
    });
    expect(result).toBeDefined();
  });
});
