import { convertDDItoScopeDeclr } from "../handle_select";

describe("handleSelect()", () => {
  it("returns location data: point", () => {
    const ddi =
      ({ headingId: "GenericPointer", label: "Point 1 (10, 20, 30)", value: 2 });
    const location = convertDDItoScopeDeclr(ddi);
    expect(location).toEqual({
      kind: "point",
      args: {
        pointer_id: 2,
        pointer_type: "GenericPointer"
      }
    });
  });

  it("returns location data: tool", () => {
    const ddi = { headingId: "Tool", label: "Generic Tool", value: 1 };
    const location = convertDDItoScopeDeclr(ddi);
    expect(location).toEqual({ kind: "tool", args: { tool_id: 1 } });
  });

  it("returns location data: default", () => {
    const location = convertDDItoScopeDeclr({ label: "None", value: "" });
    expect(location)
      .toEqual({ kind: "coordinate", args: { x: 0, y: 0, z: 0 } });
  });

  it("returns location data: identifier", () => {
    const ddi = ({ headingId: "identifier", label: "Parent", value: "parent" });
    const location = convertDDItoScopeDeclr(ddi);
    expect(location).toEqual({
      kind: "identifier", args: { label: "parent" }
    });
  });
});
