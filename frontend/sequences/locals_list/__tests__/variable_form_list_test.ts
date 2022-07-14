import {
  variableFormList, dropDownName, formatTool, groups2Ddi, activeToolDDIs,
  sequences2Ddi,
} from "../variable_form_list";
import { fakeResourceIndex } from "../test_helpers";
import {
  fakeToolSlot, fakeTool, fakePointGroup, fakeSequence,
} from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { VariableType } from "../locals_list_support";

describe("variableFormList()", () => {
  it("returns dropdown list", () => {
    const pointGroup = fakePointGroup();
    pointGroup.body.id = 1;
    const resources = fakeResourceIndex([pointGroup]);
    expect(variableFormList(resources, [], [], true))
      .toEqual([
        {
          headingId: "Coordinate",
          label: "Custom coordinates",
          value: "",
        },
        {
          headingId: "Tool",
          label: "Tools and Seed Containers",
          value: 0,
          heading: true,
        },
        {
          headingId: "Tool",
          label: "Generic tool (100, 200, 300)",
          value: "1",
        },
        {
          headingId: "PointGroup",
          label: "Groups",
          value: 0,
          heading: true,
        },
        {
          headingId: "PointGroup",
          label: "Fake (0)",
          value: "1"
        },
        {
          headingId: "Plant",
          label: "Plants",
          value: 0,
          heading: true,
        },
        {
          headingId: "Plant",
          label: "Plant 1 (1, 2, 3)",
          value: "1"
        },
        {
          headingId: "Plant",
          label: "Dandelion (100, 200, 300)",
          value: "4"
        },
        {
          headingId: "GenericPointer",
          label: "Map Points",
          value: 0,
          heading: true,
        },
        {
          headingId: "GenericPointer",
          label: "Point 1 (10, 20, 30)",
          value: "2"
        },
        {
          headingId: "Weed",
          label: "Weeds",
          value: 0,
          heading: true,
        },
        {
          headingId: "Weed",
          label: "Weed 1 (15, 25, 35)",
          value: "5"
        },
      ]);
  });

  it("returns empty dropdown list", () => {
    const resources = buildResourceIndex([]).index;
    expect(variableFormList(resources, []))
      .toEqual([
        {
          headingId: "Coordinate",
          label: "Custom coordinates",
          value: "",
        },
        {
          headingId: "Tool",
          label: "Tools and Seed Containers",
          value: 0,
          heading: true,
        },
        {
          headingId: "Plant",
          label: "Plants",
          value: 0,
          heading: true,
        },
        {
          headingId: "GenericPointer",
          label: "Map Points",
          value: 0,
          heading: true,
        },
        {
          headingId: "Weed",
          label: "Weeds",
          value: 0,
          heading: true,
        },
      ]);
  });

  it("returns resource dropdown list", () => {
    const resources = buildResourceIndex([]).index;
    expect(variableFormList(resources, [], [], false, VariableType.Resource))
      .toEqual([]);
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
    const result = groups2Ddi(fakes, []);
    expect(result.length).toEqual(1);
    expect(result[0].label).toEqual(fakes[0].body.name + " (0)");
    expect(result[0].value).toEqual("1");
  });
});

describe("sequences2Ddi()", () => {
  it("returns items", () => {
    const fakes = [fakeSequence(), fakeSequence()];
    fakes[0].body.id = 1;
    fakes[1].body.id = undefined;
    const result = sequences2Ddi(fakes);
    expect(result.length).toEqual(1);
    expect(result[0].label).toEqual(fakes[0].body.name);
    expect(result[0].value).toEqual("1");
  });
});

describe("activeToolDDIs()", () => {
  it("returns active tools", () => {
    const toolSlot = fakeToolSlot();
    toolSlot.body.tool_id = 1;
    const tool = fakeTool();
    tool.body.name = undefined;
    tool.body.id = 1;
    const resourceIndex = buildResourceIndex([toolSlot, tool]).index;
    expect(activeToolDDIs(resourceIndex)).toEqual([
      { label: "Untitled tool (0, 0, 0)", value: "1", headingId: "Tool" },
    ]);
  });

  it("doesn't return inactive tools", () => {
    const toolSlot1 = fakeToolSlot();
    toolSlot1.body.tool_id = undefined;
    const toolSlot2 = fakeToolSlot();
    toolSlot2.body.tool_id = -1;
    const tool = fakeTool();
    tool.body.id = -1;
    const resourceIndex = buildResourceIndex([toolSlot1, toolSlot2, tool]).index;
    expect(activeToolDDIs(resourceIndex)).toEqual([]);
  });
});
