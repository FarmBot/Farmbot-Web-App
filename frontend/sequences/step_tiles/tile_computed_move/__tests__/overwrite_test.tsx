import React from "react";
import { mount, shallow } from "enzyme";
import {
  OverwriteInputRowProps, AxisSelection, LocSelection,
} from "../interfaces";
import {
  OverwriteInputRow, overwriteAxis, getOverwriteState, getOverwriteNode,
  setOverwrite,
  OVERWRITE_OPTION_LOOKUP,
} from "../overwrite";
import { Move } from "farmbot";
import { MoveStepInput } from "../input";
import { FBSelect } from "../../../../ui";

describe("overwriteAxis()", () => {
  it("doesn't return node", () => {
    const node = overwriteAxis("x", undefined);
    expect(node).toEqual([]);
  });
});

describe("getOverwriteState()", () => {
  it("returns special value", () => {
    const step: Move = {
      kind: "move", args: {}, body: [{
        kind: "axis_overwrite",
        args: {
          axis: "x",
          axis_operand: {
            kind: "special_value",
            args: { label: "soil_height" }
          }
        }
      }]
    };
    expect(getOverwriteState(step, "x")).toEqual({
      selection: AxisSelection.soil_height,
      overwrite: undefined,
    });
  });
});

describe("getOverwriteNode()", () => {
  it("returns node", () => {
    expect(getOverwriteNode(undefined, AxisSelection.safe_height, false))
      .toEqual({ kind: "special_value", args: { label: "safe_height" } });
    expect(getOverwriteNode(undefined, AxisSelection.soil_height, false))
      .toEqual({ kind: "special_value", args: { label: "soil_height" } });
    expect(getOverwriteNode(undefined, undefined, true))
      .toEqual({ kind: "special_value", args: { label: "current_location" } });
  });
});

describe("<OverwriteInputRow />", () => {
  const fakeProps = (): OverwriteInputRowProps => ({
    selection: { x: undefined, y: undefined, z: undefined },
    overwrite: { x: undefined, y: undefined, z: undefined },
    disabledAxes: { x: false, y: false, z: false },
    locationSelection: undefined,
    onCommit: jest.fn(),
    setAxisState: jest.fn(),
    setAxisOverwriteState: jest.fn(),
  });

  it("changes overwrite selection", () => {
    const p = fakeProps();
    const wrapper = shallow(<OverwriteInputRow {...p} />);
    wrapper.find("FBSelect").first().simulate("change", {
      label: "", value: "custom"
    });
    expect(p.setAxisOverwriteState)
      .toHaveBeenCalledWith("x", AxisSelection.custom);
  });

  it("clears overwrite value", () => {
    const p = fakeProps();
    p.selection = {
      x: AxisSelection.custom,
      y: AxisSelection.custom,
      z: AxisSelection.custom,
    };
    const wrapper = shallow(<OverwriteInputRow {...p} />);
    wrapper.find(MoveStepInput).first().simulate("clear");
    expect(p.setAxisOverwriteState)
      .toHaveBeenCalledWith("x", AxisSelection.none);
  });

  it("renders custom", () => {
    const p = fakeProps();
    p.locationSelection = LocSelection.custom;
    const wrapper = mount(<OverwriteInputRow {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("x, y, z (mm)");
  });

  it("renders options", () => {
    const p = fakeProps();
    const wrapper = mount(<OverwriteInputRow {...p} />);
    const items = wrapper.find(FBSelect).last().props().list;
    expect(items)
      .toContainEqual(OVERWRITE_OPTION_LOOKUP()[AxisSelection.safe_height]);
    expect(items)
      .toContainEqual(OVERWRITE_OPTION_LOOKUP()[AxisSelection.soil_height]);
  });
});

describe("setOverwrite()", () => {
  it("returns overwrite value", () => {
    expect(setOverwrite(AxisSelection.lua)).toEqual("");
    expect(setOverwrite(AxisSelection.custom)).toEqual(0);
    expect(setOverwrite(AxisSelection.none)).toEqual(undefined);
  });
});
