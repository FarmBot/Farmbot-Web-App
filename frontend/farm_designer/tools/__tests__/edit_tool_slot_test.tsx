jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
  destroy: jest.fn(),
}));

const mockDevice = { moveAbsolute: jest.fn(() => Promise.resolve()) };
jest.mock("../../../device", () => ({ getDevice: () => mockDevice }));

import * as React from "react";
import { mount, shallow } from "enzyme";
import {
  RawEditToolSlot as EditToolSlot, EditToolSlotProps, mapStateToProps
} from "../edit_tool_slot";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  fakeToolSlot, fakeTool
} from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex
} from "../../../__test_support__/resource_index_builder";
import { destroy, edit, save } from "../../../api/crud";

describe("<EditToolSlot />", () => {
  const fakeProps = (): EditToolSlotProps => ({
    findToolSlot: jest.fn(),
    tools: [],
    findTool: jest.fn(),
    botPosition: { x: undefined, y: undefined, z: undefined },
    dispatch: jest.fn(),
    firmwareHardware: undefined,
  });

  it("redirects", () => {
    const wrapper = mount(<EditToolSlot {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("redirecting");
  });

  it("renders", () => {
    const p = fakeProps();
    p.findToolSlot = () => fakeToolSlot();
    const wrapper = mount(<EditToolSlot {...p} />);
    ["edit tool slot", "x (mm)", "y (mm)", "z (mm)", "tool or seed container",
      "change slot direction", "use current location", "gantry-mounted"
    ].map(string => expect(wrapper.text().toLowerCase()).toContain(string));
  });

  it("updates tool slot", () => {
    const slot = fakeToolSlot();
    const wrapper = mount<EditToolSlot>(<EditToolSlot {...fakeProps()} />);
    wrapper.instance().updateSlot(slot)({ x: 123 });
    expect(edit).toHaveBeenCalledWith(slot, { x: 123 });
    expect(save).toHaveBeenCalledWith(slot.uuid);
  });

  it("moves to tool slot", () => {
    const p = fakeProps();
    const toolSlot = fakeToolSlot();
    toolSlot.body.x = 1;
    toolSlot.body.y = 2;
    toolSlot.body.z = 3;
    p.findToolSlot = () => toolSlot;
    const wrapper = shallow(<EditToolSlot {...p} />);
    wrapper.find(".gray").last().simulate("click");
    expect(mockDevice.moveAbsolute).toHaveBeenCalledWith({ x: 1, y: 2, z: 3 });
  });

  it("removes tool slot", () => {
    const p = fakeProps();
    const toolSlot = fakeToolSlot();
    p.findToolSlot = () => toolSlot;
    const wrapper = shallow(<EditToolSlot {...p} />);
    wrapper.find("button").last().simulate("click");
    expect(destroy).toHaveBeenCalledWith(toolSlot.uuid);
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const tool = fakeTool();
    tool.body.id = 1;
    const toolSlot = fakeToolSlot();
    toolSlot.body.id = 1;
    const state = fakeState();
    state.resources = buildResourceIndex([tool, toolSlot]);
    const props = mapStateToProps(state);
    expect(props.findTool(1)).toEqual(tool);
    expect(props.findToolSlot("1")).toEqual(toolSlot);
  });

  it("doesn't find tool slot", () => {
    const state = fakeState();
    state.resources = buildResourceIndex([]);
    const props = mapStateToProps(state);
    expect(props.findToolSlot("1")).toEqual(undefined);
  });
});
