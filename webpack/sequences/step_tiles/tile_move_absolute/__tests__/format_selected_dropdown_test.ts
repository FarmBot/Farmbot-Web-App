import { formatSelectedDropdown } from "../format_selected_dropdown";
import { fakeResourceIndex } from "../test_helpers";
import { PARENT_DDI } from "../generate_list";

describe("formatSelectedDropdown()", () => {
  it("returns dropdown item: tool", () => {
    const dropdown = formatSelectedDropdown(fakeResourceIndex(),
      { kind: "tool", args: { tool_id: 1 } });
    expect(dropdown).toEqual({ label: "Generic Tool", value: 1 });
  });

  it("returns dropdown item: point", () => {
    const dropdown = formatSelectedDropdown(fakeResourceIndex(),
      {
        kind: "point", args: {
          pointer_type: "GenericPointer", pointer_id: 2
        }
      });
    expect(dropdown).toEqual({
      label: "Point 1 (10, 20, 30)",
      value: 2
    });
  });

  it("returns dropdown item: plant", () => {
    const dropdown = formatSelectedDropdown(fakeResourceIndex(),
      {
        kind: "point", args: {
          pointer_type: "Plant", pointer_id: 1
        }
      });
    expect(dropdown).toEqual({
      label: "Plant 1 (1, 2, 3)",
      value: 1
    });
  });

  it("returns dropdown item: coordinate", () => {
    const dropdown = formatSelectedDropdown(fakeResourceIndex(),
      { kind: "coordinate", args: { x: 10, y: 20, z: 30 } });
    expect(dropdown).toEqual({ label: "None", value: "" });
  });

  it("returns dropdown item: identifier", () => {
    const ddi = formatSelectedDropdown(fakeResourceIndex(),
      { kind: "identifier", args: { label: "parent" } });
    expect(ddi).toEqual(PARENT_DDI[0]);
  });
});
