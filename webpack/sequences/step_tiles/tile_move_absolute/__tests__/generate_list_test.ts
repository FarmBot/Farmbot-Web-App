import { generateList, dropDownName } from "../generate_list";
import { fakeResourceIndex } from "../test_helpers";

describe("generateList()", () => {
  it("returns dropdown list", () => {
    const items = generateList(fakeResourceIndex(), []);
    const toolHeading = items[0];
    expect(toolHeading).toEqual({
      headingId: "Tool",
      label: "Tools",
      value: 0,
      heading: true,
    });
    const tool = items[1];
    expect(tool).toEqual({
      headingId: "Tool",
      label: "Generic tool (100, 200, 300)",
      value: "1",
    });
    const plantHeading = items[2];
    expect(plantHeading).toEqual({
      headingId: "Plant",
      label: "Plants",
      value: 0,
      heading: true,
    });
    const plant = items[4];
    expect(plant).toEqual({
      headingId: "Plant",
      label: "Plant 1 (1, 2, 3)",
      value: "1"
    });
    const pointHeading = items[5];
    expect(pointHeading).toEqual({
      headingId: "GenericPointer",
      label: "Map Points",
      value: 0,
      heading: true,
    });
    const point = items[6];
    expect(point).toEqual({
      headingId: "GenericPointer",
      label: "Point 1 (10, 20, 30)",
      value: "2"
    });
    const otherHeading = items[7];
    expect(otherHeading).toEqual({
      headingId: "Other",
      label: "Other",
      value: 0,
      heading: true,
    });
  });
});

describe("dropDownName()", () => {
  it("returns label", () => {
    const label = dropDownName("Plant 1", { x: 10, y: 20, z: 30 });
    expect(label).toEqual("Plant 1 (10, 20, 30)");
  });
});
