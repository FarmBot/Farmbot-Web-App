import React from "react";
import { mount } from "enzyme";
import { BoxTopGpioDiagram, BoxTopGpioDiagramProps } from "../box_top_gpio_diagram";

describe("<BoxTopGpioDiagram />", () => {
  const fakeProps = (): BoxTopGpioDiagramProps => ({
    boundPins: [16],
    setSelectedPin: jest.fn(),
    selectedPin: undefined
  });

  it("renders", () => {
    const p = fakeProps();
    p.boundPins = undefined;
    const wrapper = mount(<BoxTopGpioDiagram {...p} />);
    expect(wrapper.find("circle").length).toEqual(18);
  });

  it("pin hover", () => {
    const wrapper = mount<BoxTopGpioDiagram>(<BoxTopGpioDiagram
      {...fakeProps()} />);
    wrapper.find("#button").at(0).simulate("mouseEnter");
    expect(wrapper.instance().state.hoveredPin).toEqual(20);
  });

  it("doesn't hover pin", () => {
    const wrapper = mount<BoxTopGpioDiagram>(<BoxTopGpioDiagram
      {...fakeProps()} />);
    wrapper.find("#button").at(6).simulate("mouseEnter");
    expect(wrapper.instance().state.hoveredPin).toEqual(undefined);
  });

  it("pin click", () => {
    const p = fakeProps();
    const wrapper = mount(<BoxTopGpioDiagram {...p} />);
    wrapper.find("#button").at(0).simulate("click");
    expect(p.setSelectedPin).toHaveBeenCalledWith(20);
  });
});
