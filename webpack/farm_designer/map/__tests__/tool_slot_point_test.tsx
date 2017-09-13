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

  it("doesn't display tool name", () => {
    const wrapper = shallow(<ToolSlotPoint {...fakeProps() } />);
    expect(wrapper.find("text").props().visibility).toEqual("hidden");
  });

});
