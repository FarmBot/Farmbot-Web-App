import * as React from "react";
import { ToolSlotPoint, TSPProps } from "../tool_slot_point";
import { shallow } from "enzyme";
import { fakeToolSlot, fakeTool } from "../../../__test_support__/fake_state/resources";

describe("<ToolSlotPoint/>", () => {
  function fakeProps(): TSPProps {
    return {
      mapTransformProps: {
        quadrant: 2, gridSize: { x: 3000, y: 1500 }
      },
      slot: { toolSlot: fakeToolSlot(), tool: fakeTool() }
    };
  }

  it("renders tool slot point", () => {
    const wrapper = shallow(<ToolSlotPoint {...fakeProps() } />);
    const props = wrapper.find("circle").last().props();
    expect(props.r).toEqual(35);
    expect(props.cx).toEqual(10);
    expect(props.cy).toEqual(10);
  });

  it("displays tool name", () => {
    const wrapper = shallow(<ToolSlotPoint {...fakeProps() } />);
    wrapper.setState({ hovered: true });
    expect(wrapper.find("text").props().visibility).toEqual("visible");
    expect(wrapper.find("text").text()).toEqual("Foo");
  });

  it("displays 'no tool'", () => {
    const p = fakeProps();
    p.slot.tool = undefined;
    const wrapper = shallow(<ToolSlotPoint {...p } />);
    wrapper.setState({ hovered: true });
    expect(wrapper.find("text").text()).toEqual("no tool");
  });

  it("doesn't display tool name", () => {
    const wrapper = shallow(<ToolSlotPoint {...fakeProps() } />);
    expect(wrapper.find("text").props().visibility).toEqual("hidden");
  });

  it("renders special tool styling: bin", () => {
    const p = fakeProps();
    if (p.slot.tool) { p.slot.tool.body.name = "Seed Bin"; }
    const wrapper = shallow(<ToolSlotPoint {...p } />);
    const elements = wrapper.find("#seed-bin").find("circle");
    expect(elements.length).toEqual(2);
    expect(elements.last().props().fill).toEqual("url(#SeedBinGradient)");
    wrapper.setState({ hovered: true });
    expect(wrapper.find("#seed-bin").find("circle").length).toEqual(3);
  });

  it("renders special tool styling: tray", () => {
    const p = fakeProps();
    if (p.slot.tool) { p.slot.tool.body.name = "Seed Tray"; }
    const wrapper = shallow(<ToolSlotPoint {...p } />);
    const elements = wrapper.find("#seed-tray");
    expect(elements.find("circle").length).toEqual(1);
    expect(elements.find("rect").length).toEqual(1);
    expect(elements.find("rect").props().fill).toEqual("url(#SeedTrayPattern)");
    wrapper.setState({ hovered: true });
    expect(wrapper.find("#seed-tray").find("circle").length).toEqual(2);
  });

  it("doesn't render toolbay slot", () => {
    const p = fakeProps();
    p.slot.toolSlot.body.pullout_direction = 0;
    const wrapper = shallow(<ToolSlotPoint {...p } />);
    expect(wrapper.find("use").length).toEqual(0);
  });

  it("renders toolbay slot", () => {
    const p = fakeProps();
    p.slot.toolSlot.body.pullout_direction = 1;
    const wrapper = shallow(<ToolSlotPoint {...p } />);
    expect(wrapper.find("use").length).toEqual(1);
  });
});
