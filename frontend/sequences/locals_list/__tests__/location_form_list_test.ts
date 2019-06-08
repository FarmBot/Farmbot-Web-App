import { locationFormList, dropDownName } from "../location_form_list";
import { fakeResourceIndex } from "../test_helpers";

describe("locationFormList()", () => {
  it("returns dropdown list", () => {
    const items = locationFormList(fakeResourceIndex(), []);
    const coordinate = items[0];
    expect(coordinate).toEqual({
      headingId: "Coordinate",
      label: "Custom Coordinates",
      value: "",
    });
    const toolHeading = items[1];
    expect(toolHeading).toEqual({
      headingId: "Tool",
      label: "Tools and Seed Containers",
      value: 0,
      heading: true,
    });
    const tool = items[2];
    expect(tool).toEqual({
      headingId: "Tool",
      label: "Generic tool (100, 200, 300)",
      value: "1",
    });
    const plantHeading = items[3];
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
    const pointHeading = items[6];
    expect(pointHeading).toEqual({
      headingId: "GenericPointer",
      label: "Map Points",
      value: 0,
      heading: true,
    });
    const point = items[7];
    expect(point).toEqual({
      headingId: "GenericPointer",
      label: "Point 1 (10, 20, 30)",
      value: "2"
    });
  });
});

describe("dropDownName()", () => {
  it("returns label", () => {
    const label = dropDownName("Plant 1", { x: 10, y: 20, z: 30 });
    expect(label).toEqual("Plant 1 (10, 20, 30)");
  });

  it("returns untitled label", () => {
    const label = dropDownName("", { x: 10, y: 20, z: 30 });
    expect(label).toEqual("Untitled (10, 20, 30)");
  });
});
