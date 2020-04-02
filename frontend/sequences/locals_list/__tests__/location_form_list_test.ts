import {
  locationFormList, dropDownName, formatTool, groups2Ddi,
} from "../location_form_list";
import { fakeResourceIndex } from "../test_helpers";
import {
  fakeToolSlot, fakeTool, fakePointGroup,
} from "../../../__test_support__/fake_state/resources";

describe("locationFormList()", () => {
  it("returns dropdown list", () => {
    const pg = fakePointGroup();
    pg.body.id = 1;
    const items = locationFormList(fakeResourceIndex([pg]), [], true);
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
    const groupHeading = items[3];
    expect(groupHeading).toEqual({
      headingId: "PointGroup",
      label: "Groups",
      value: 0,
      heading: true,
    });
    const group = items[4];
    expect(group).toEqual({
      headingId: "PointGroup",
      label: "Fake",
      value: "1"
    });
    const plantHeading = items[5];
    expect(plantHeading).toEqual({
      headingId: "Plant",
      label: "Plants",
      value: 0,
      heading: true,
    });
    const plant = items[6];
    expect(plant).toEqual({
      headingId: "Plant",
      label: "Plant 1 (1, 2, 3)",
      value: "1"
    });
    const pointHeading = items[8];
    expect(pointHeading).toEqual({
      headingId: "GenericPointer",
      label: "Map Points",
      value: 0,
      heading: true,
    });
    const point = items[9];
    expect(point).toEqual({
      headingId: "GenericPointer",
      label: "Point 1 (10, 20, 30)",
      value: "2"
    });
    const weedHeading = items[10];
    expect(weedHeading).toEqual({
      headingId: "Weed",
      label: "Weeds",
      value: 0,
      heading: true,
    });
    const weed = items[11];
    expect(weed).toEqual({
      headingId: "Weed",
      label: "Weed 1 (15, 25, 35)",
      value: "5"
    });
  });
});

describe("formatTool()", () => {
  it("returns ddi for tool", () => {
    const ddi = formatTool(fakeTool(), fakeToolSlot());
    expect(ddi.label).toEqual("Foo (0, 0, 0)");
  });

  it("returns ddi for tool when gantry mounted", () => {
    const toolSlot = fakeToolSlot();
    toolSlot.body.gantry_mounted = true;
    const ddi = formatTool(fakeTool(), toolSlot);
    expect(ddi.label).toEqual("Foo (gantry, 0, 0)");
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

  it("returns label with undefined coordinates", () => {
    const label = dropDownName("Plant 1",
      { x: undefined, y: undefined, z: undefined });
    expect(label).toEqual("Plant 1 (---, ---, ---)");
  });
});

describe("groups2Ddi", () => {
  it("excludes unsaved groups", () => {
    const fakes = [fakePointGroup(), fakePointGroup()];
    fakes[0].body.id = 1;
    fakes[1].body.id = undefined;
    const result = groups2Ddi(fakes);
    expect(result.length).toEqual(1);
    expect(result[0].label).toEqual(fakes[0].body.name);
    expect(result[0].value).toEqual("1");
  });
});
