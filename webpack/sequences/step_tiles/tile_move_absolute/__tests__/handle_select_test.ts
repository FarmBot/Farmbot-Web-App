import { handleSelect } from "../handle_select";
import { fakeResourceIndex } from "../test_helpers";

describe("handleSelect()", () => {
  it("returns location data: point", () => {
    const location = handleSelect(fakeResourceIndex(),
      {
        headingId: "GenericPointer",
        label: "Point 1 (10, 20, 30)",
        value: 2
      });
    expect(location).toEqual({
      kind: "point", args: { pointer_id: 2, pointer_type: "GenericPointer" }
    });
  });

  it("returns location data: tool", () => {
    const location = handleSelect(fakeResourceIndex(),
      {
        headingId: "Tool",
        label: "Generic Tool",
        value: 1
      });
    expect(location).toEqual({ kind: "tool", args: { tool_id: 1 } });
  });

  it("returns location data: default", () => {
    const location = handleSelect(fakeResourceIndex(),
      { label: "None", value: "" });
    expect(location).toEqual({
      kind: "coordinate", args: { x: 0, y: 0, z: 0 }
    });
  });

  it("handles 'parameter_declaration's", () => {
    const result = handleSelect(fakeResourceIndex(), {
      headingId: "parameter",
      value: "parent",
      label: "1"
    });
    expect(result.kind).toBe("parameter_declaration");
    if (result.kind == "parameter_declaration") {
      expect(result.args.label).toBe("parent");
      expect(result.args.data_type).toBe("point");
    }
  });

  it("returns location data: identifier", () => {
    const location = handleSelect(fakeResourceIndex(),
      {
        headingId: "identifier",
        label: "Parent",
        value: "parent"
      });
    expect(location).toEqual({
      kind: "identifier", args: { label: "parent" }
    });
  });
});
