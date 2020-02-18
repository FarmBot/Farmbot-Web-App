import * as React from "react";
import { shallow, mount } from "enzyme";
import {
  GantryMountedInput, GantryMountedInputProps,
  UseCurrentLocationInputRow, UseCurrentLocationInputRowProps,
  SlotDirectionInputRow, SlotDirectionInputRowProps,
  ToolInputRow, ToolInputRowProps,
  SlotLocationInputRow, SlotLocationInputRowProps,
  ToolSelection, ToolSelectionProps,
} from "../tool_slot_edit_components";
import { fakeTool } from "../../../__test_support__/fake_state/resources";
import { FBSelect } from "../../../ui";

describe("<GantryMountedInput />", () => {
  const fakeProps = (): GantryMountedInputProps => ({
    gantryMounted: false,
    onChange: jest.fn(),
  });

  it("renders", () => {
    const wrapper = shallow(<GantryMountedInput {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("gantry-mounted");
  });

  it("changes value", () => {
    const p = fakeProps();
    const wrapper = shallow(<GantryMountedInput {...p} />);
    wrapper.find("input").simulate("change");
    expect(p.onChange).toHaveBeenCalledWith({ gantry_mounted: true });
  });
});

describe("<UseCurrentLocationInputRow />", () => {
  const fakeProps = (): UseCurrentLocationInputRowProps => ({
    botPosition: { x: undefined, y: undefined, z: undefined },
    onChange: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<UseCurrentLocationInputRow {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("use current location");
  });

  it("doesn't change value", () => {
    const p = fakeProps();
    const wrapper = shallow(<UseCurrentLocationInputRow {...p} />);
    wrapper.find("button").simulate("click");
    expect(p.onChange).not.toHaveBeenCalled();
  });

  it("changes value", () => {
    const p = fakeProps();
    p.botPosition = { x: 0, y: 1, z: 2 };
    const wrapper = shallow(<UseCurrentLocationInputRow {...p} />);
    wrapper.find("button").simulate("click");
    expect(p.onChange).toHaveBeenCalledWith(p.botPosition);
  });
});

describe("<SlotDirectionInputRow />", () => {
  const fakeProps = (): SlotDirectionInputRowProps => ({
    toolPulloutDirection: 0,
    onChange: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<SlotDirectionInputRow {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("change slot direction");
  });

  it("changes value by click", () => {
    const p = fakeProps();
    const wrapper = shallow(<SlotDirectionInputRow {...p} />);
    wrapper.find("i").first().simulate("click");
    expect(p.onChange).toHaveBeenCalledWith({ pullout_direction: 1 });
  });

  it("changes value by selection", () => {
    const p = fakeProps();
    const wrapper = shallow(<SlotDirectionInputRow {...p} />);
    wrapper.find("FBSelect").simulate("change", { label: "", value: 1 });
    expect(p.onChange).toHaveBeenCalledWith({ pullout_direction: 1 });
  });
});

describe("<ToolSelection />", () => {
  const fakeProps = (): ToolSelectionProps => ({
    tools: [],
    selectedTool: undefined,
    onChange: jest.fn(),
    filterSelectedTool: false,
  });

  it("renders", () => {
    const wrapper = mount(<ToolSelection {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("none");
  });

  it("handles missing tool data", () => {
    const p = fakeProps();
    const tool = fakeTool();
    tool.body.name = undefined;
    tool.body.id = undefined;
    p.tools = [tool];
    const wrapper = shallow(<ToolSelection {...p} />);
    expect(wrapper.find("FBSelect").props().list).toEqual([]);
  });

  it("handles missing selected tool data", () => {
    const p = fakeProps();
    const tool = fakeTool();
    tool.body.name = undefined;
    p.selectedTool = tool;
    const wrapper = shallow(<ToolSelection {...p} />);
    expect(wrapper.find(FBSelect).props().selectedItem)
      .toEqual(expect.objectContaining({ label: "untitled" }));
  });

  it("shows selected tool", () => {
    const p = fakeProps();
    p.selectedTool = fakeTool();
    const wrapper = mount(<ToolSelection {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("foo");
  });

  it("changes value", () => {
    const p = fakeProps();
    const wrapper = shallow(<ToolSelection {...p} />);
    wrapper.find("FBSelect").simulate("change", { label: "", value: 1 });
    expect(p.onChange).toHaveBeenCalledWith({ tool_id: 1 });
  });
});

describe("<ToolInputRow />", () => {
  const fakeProps = (): ToolInputRowProps => ({
    tools: [],
    selectedTool: undefined,
    onChange: jest.fn(),
    isExpress: false,
  });

  it("renders", () => {
    const wrapper = mount(<ToolInputRow {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("tool");
  });

  it("shows selected tool", () => {
    const p = fakeProps();
    p.selectedTool = fakeTool();
    const wrapper = mount(<ToolInputRow {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("foo");
  });

  it("renders for express bots", () => {
    const p = fakeProps();
    p.isExpress = true;
    const wrapper = mount(<ToolInputRow {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("seed container");
  });
});

describe("<SlotLocationInputRow />", () => {
  const fakeProps = (): SlotLocationInputRowProps => ({
    slotLocation: { x: 0, y: 0, z: 0 },
    gantryMounted: false,
    onChange: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<SlotLocationInputRow {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("x (mm)y (mm)z (mm)");
    expect(wrapper.find("input").first().props().value).toEqual(0);
  });

  it("renders gantry-mounted slot", () => {
    const p = fakeProps();
    p.gantryMounted = true;
    const wrapper = mount(<SlotLocationInputRow {...p} />);
    expect(wrapper.find("input").first().props().value).toEqual("Gantry");
  });

  it("changes value", () => {
    const p = fakeProps();
    const wrapper = shallow(<SlotLocationInputRow {...p} />);
    wrapper.find("BlurableInput").at(0).simulate("commit", {
      currentTarget: { value: 1 }
    });
    wrapper.find("BlurableInput").at(1).simulate("commit", {
      currentTarget: { value: 2 }
    });
    wrapper.find("BlurableInput").at(2).simulate("commit", {
      currentTarget: { value: 3 }
    });
    expect(p.onChange).toHaveBeenCalledWith({ x: 1 });
    expect(p.onChange).toHaveBeenCalledWith({ y: 2 });
    expect(p.onChange).toHaveBeenCalledWith({ z: 3 });
  });
});
