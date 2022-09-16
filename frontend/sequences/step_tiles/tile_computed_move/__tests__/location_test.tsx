import React from "react";
import { shallow } from "enzyme";
import {
  LocationSelection,
  getLocationState,
  setSelectionFromLocation,
  setOverwriteFromLocation,
  setOffsetFromLocation,
} from "../location";
import {
  LocationSelectionProps, LocationNode, LocSelection, AxisSelection,
} from "../interfaces";
import {
  buildResourceIndex,
} from "../../../../__test_support__/resource_index_builder";
import {
  fakeSequence, fakeToolSlot, fakeTool,
} from "../../../../__test_support__/fake_state/resources";
import { DropDownItem } from "../../../../ui";
import { Move, VariableDeclaration } from "farmbot";
import { fakeVariableNameSet } from "../../../../__test_support__/fake_variables";
import { COORDINATE_DDI } from "../../../locals_list/variable_form_list";

describe("<LocationSelection />", () => {
  const fakeProps = (): LocationSelectionProps => ({
    locationNode: undefined,
    locationSelection: undefined,
    resources: buildResourceIndex().index,
    onChange: jest.fn(),
    sequence: fakeSequence(),
    sequenceUuid: "uuid",
  });

  it.each<[
    DropDownItem | undefined,
    LocationNode | undefined,
    LocSelection | undefined,
  ]>([
    [{ label: "", value: "" }, undefined, undefined],
    [
      { label: "", value: "", headingId: "Coordinate" },
      undefined,
      LocSelection.custom,
    ],
    [
      { label: "", value: "", headingId: "Offset" },
      undefined,
      LocSelection.offset,
    ],
    [
      { label: "", value: "label", headingId: "Identifier" },
      { kind: "identifier", args: { label: "label" } },
      LocSelection.identifier,
    ],
    [
      { label: "", value: "1", headingId: "Plant" },
      { kind: "point", args: { pointer_type: "Plant", pointer_id: 1 } },
      LocSelection.point,
    ],
    [
      { label: "", value: "1", headingId: "Tool" },
      { kind: "tool", args: { tool_id: 1 } },
      LocSelection.tool,
    ],
  ])("changes location: %s", (ddi, locationNode, locationSelection) => {
    const p = fakeProps();
    const wrapper = shallow(<LocationSelection {...p} />);
    wrapper.simulate("change", ddi);
    expect(p.onChange).toHaveBeenCalledWith({
      locationNode, locationSelection,
    });
  });

  it.each<[
    LocSelection | undefined,
    LocationNode | undefined,
    DropDownItem | undefined,
  ]>([
    [undefined, undefined, undefined],
    [
      LocSelection.custom,
      undefined,
      COORDINATE_DDI(),
    ],
    [
      LocSelection.offset,
      undefined,
      { label: "Offset from current location", value: "" },
    ],
    [
      LocSelection.identifier,
      { kind: "identifier", args: { label: "variable" } },
      { label: "Location - Add new", value: "variable" },
    ],
    [
      LocSelection.tool,
      { kind: "tool", args: { tool_id: 1 } },
      { label: "Foo (0, 0, 0)", value: "1", headingId: "Tool" },
    ],
  ])("shows selection: %s", (locationSelection, locationNode, ddi) => {
    const p = fakeProps();
    const slot = fakeToolSlot();
    slot.body.tool_id = 1;
    const tool = fakeTool();
    tool.body.id = 1;
    p.resources = buildResourceIndex([tool, slot]).index;
    p.locationNode = locationNode;
    p.locationSelection = locationSelection;
    const wrapper = shallow(<LocationSelection {...p} />);
    expect(wrapper.props().selectedItem).toEqual(ddi);
  });

  it("shows selection: variable", () => {
    const p = fakeProps();
    p.locationNode = { kind: "identifier", args: { label: "variable" } };
    p.locationSelection = LocSelection.identifier;
    const variables = fakeVariableNameSet("variable", { x: 10, y: 20, z: 30 });
    p.resources = buildResourceIndex([]).index;
    p.resources.sequenceMetas["uuid"] = variables;
    const wrapper = shallow(<LocationSelection {...p} />);
    expect(wrapper.props().selectedItem).toEqual({
      label: "variable - fake variable info label", value: "variable",
    });
  });

  it("shows location list", () => {
    const p = fakeProps();
    p.locationNode = { kind: "identifier", args: { label: "parent" } };
    p.locationSelection = LocSelection.identifier;
    const vector = { x: 10, y: 20, z: 30 };
    const node: VariableDeclaration = {
      kind: "variable_declaration",
      args: {
        label: "parent", data_value: {
          kind: "coordinate", args: vector
        }
      }
    };
    const variables = fakeVariableNameSet("parent", vector, node);
    p.resources = buildResourceIndex([]).index;
    variables["other"] = undefined;
    p.resources.sequenceMetas["uuid"] = variables;
    const wrapper = shallow(<LocationSelection {...p} />);
    expect(wrapper.props().list).toEqual([
      {
        headingId: "Coordinate",
        label: "Custom coordinates",
        value: "",
      },
      {
        headingId: "Offset",
        label: "Offset from current location",
        value: "",
      },
      {
        headingId: "Identifier",
        label: "Variables",
        value: 0,
        heading: true,
      },
      {
        headingId: "Identifier",
        label: "Location - fake variable info label",
        value: "parent",
      },
      {
        headingId: "Identifier",
        label: "Add new",
        value: "Location 1",
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
});

describe("getLocationState()", () => {
  it("returns custom", () => {
    const step: Move = {
      kind: "move", args: {}, body: [{
        kind: "axis_overwrite", args: {
          axis: "x",
          axis_operand: { kind: "numeric", args: { number: 1 } }
        }
      }]
    };
    expect(getLocationState(step)).toEqual({
      location: undefined,
      locationSelection: LocSelection.custom,
    });
  });

  it("returns offset", () => {
    const step: Move = {
      kind: "move", args: {}, body: [{
        kind: "axis_addition", args: {
          axis: "x",
          axis_operand: { kind: "numeric", args: { number: 1 } }
        }
      }]
    };
    expect(getLocationState(step)).toEqual({
      location: undefined,
      locationSelection: LocSelection.offset,
    });
  });

  it("returns tool", () => {
    const step: Move = {
      kind: "move", args: {}, body: [{
        kind: "axis_overwrite", args: {
          axis: "x",
          axis_operand: { kind: "tool", args: { tool_id: 1 } }
        }
      }]
    };
    expect(getLocationState(step)).toEqual({
      location: { kind: "tool", args: { tool_id: 1 } },
      locationSelection: LocSelection.tool,
    });
  });

  it("returns undefined", () => {
    const step: Move = {
      kind: "move", args: {}, body: [{
        kind: "axis_overwrite", args: {
          axis: "x",
          axis_operand: {
            kind: "special_value",
            args: { label: AxisSelection.disable },
          }
        }
      }]
    };
    expect(getLocationState(step)).toEqual({
      location: undefined,
      locationSelection: undefined,
    });
  });
});

describe("setSelectionFromLocation()", () => {
  it("returns selection state", () => {
    expect(setSelectionFromLocation(LocSelection.custom, {
      x: undefined,
      y: undefined,
      z: undefined,
    }))
      .toEqual({
        x: AxisSelection.custom,
        y: AxisSelection.custom,
        z: AxisSelection.custom,
      });
    const selection = {
      x: undefined,
      y: AxisSelection.custom,
      z: AxisSelection.disable,
    };
    expect(setSelectionFromLocation(undefined, selection)).toEqual(selection);
  });
});

describe("setOverwriteFromLocation()", () => {
  it("returns overwrite state", () => {
    expect(setOverwriteFromLocation(LocSelection.custom,
      { x: undefined, y: undefined, z: 0 }))
      .toEqual({ x: 0, y: 0, z: 0 });
    expect(setOverwriteFromLocation(LocSelection.offset,
      { x: 1, y: 2, z: 3 }))
      .toEqual({ x: undefined, y: undefined, z: undefined });
    expect(setOverwriteFromLocation(LocSelection.point,
      { x: undefined, y: 0, z: 3 }))
      .toEqual({ x: undefined, y: undefined, z: 3 });
    const vector = { x: undefined, y: 0, z: 0 };
    const undefinedVector = { x: undefined, y: undefined, z: undefined };
    expect(setOverwriteFromLocation(LocSelection.tool, vector))
      .toEqual(undefinedVector);
    expect(setOverwriteFromLocation(LocSelection.identifier, vector))
      .toEqual(undefinedVector);
    const overwrite = { x: 1, y: 2, z: 3 };
    expect(setOverwriteFromLocation(undefined, overwrite)).toEqual(overwrite);
  });
});

describe("setOffsetFromLocation()", () => {
  it("returns offset state", () => {
    expect(setOffsetFromLocation(LocSelection.custom,
      { x: 1, y: 2, z: 3 }))
      .toEqual({ x: undefined, y: undefined, z: undefined });
    expect(setOffsetFromLocation(LocSelection.offset,
      { x: undefined, y: undefined, z: 0 }))
      .toEqual({ x: 0, y: 0, z: 0 });
    const vector = { x: undefined, y: 0, z: 0 };
    const undefinedVector = { x: undefined, y: undefined, z: undefined };
    expect(setOffsetFromLocation(LocSelection.point, vector))
      .toEqual(undefinedVector);
    expect(setOffsetFromLocation(LocSelection.tool, vector))
      .toEqual(undefinedVector);
    expect(setOffsetFromLocation(LocSelection.identifier, vector))
      .toEqual(undefinedVector);
    const offset = { x: 1, y: 2, z: 3 };
    expect(setOffsetFromLocation(undefined, offset)).toEqual(offset);
  });
});
