import { generateList, dropDownName } from "../generate_list";
import { fakeResourceIndex } from "../test_helpers";

describe("generateList()", () => {
  it("returns dropdown list", () => {
    const items = generateList(fakeResourceIndex());
    const plant = items[0];
    expect(plant).toEqual({
      headingId: "Plant",
      label: "Plant: Plant 1 (1, 2, 3) ",
      value: "1"
    });
    const point = items[1];
    expect(point).toEqual({
      headingId: "GenericPointer",
      label: "Map Point: Point 1 (10, 20, 30) ",
      value: "2"
    });
    const tool = items[2];
    expect(tool).toEqual({
      headingId: "Tool",
      label: "Tool: Generic Tool",
      value: "1"
    });
  });
});

describe("dropDownName()", () => {
  it("returns label", () => {
    const label = dropDownName("Plant", "Plant 1", { x: 10, y: 20, z: 30 });
    expect(label).toEqual("Plant: Plant 1 (10, 20, 30) ");
  });
});
