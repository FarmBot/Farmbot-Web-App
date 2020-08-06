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
import { fakeSequence } from "../../../../__test_support__/fake_state/resources";
import { DropDownItem } from "../../../../ui";
import { Move } from "farmbot";
import { fakeVariableNameSet } from "../../../../__test_support__/fake_variables";

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
      { label: "", value: "", headingId: "Custom" },
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
      { label: "Custom coordinates", value: "" },
    ],
    [
      LocSelection.offset,
      undefined,
      { label: "Offset from current location", value: "" },
    ],
    [
      LocSelection.identifier,
      { kind: "identifier", args: { label: "variable" } },
      { label: "Variable - Add new", value: "variable" },
    ],
  ])("shows selection: %s", (locationSelection, locationNode, ddi) => {
    const p = fakeProps();
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
      label: "Variable - variable", value: "variable",
    });
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
    const offset = { x: 1, y: 2, z: 3 };
    expect(setOffsetFromLocation(undefined, offset)).toEqual(offset);
  });
});
