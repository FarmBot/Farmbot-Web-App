import React from "react";
import { mount } from "enzyme";
import { RpiGpioDiagram, RpiGpioDiagramProps } from "../rpi_gpio_diagram";
import { Color } from "../../../ui";

describe("<RpiGpioDiagram />", () => {
  const fakeProps = (): RpiGpioDiagramProps => ({
    boundPins: [27],
    setSelectedPin: jest.fn(),
    selectedPin: undefined
  });

  it("renders", () => {
    const wrapper = mount(<RpiGpioDiagram {...fakeProps()} />);
    expect(wrapper.find("rect").length).toEqual(42);
  });

  it("pin hover", () => {
    const wrapper = mount<RpiGpioDiagram>(<RpiGpioDiagram {...fakeProps()} />);
    wrapper.find("rect").at(5).simulate("mouseEnter");
    expect(wrapper.instance().state.hoveredPin).toEqual("GND");
    const pinToHover = wrapper.find("rect").at(6);
    pinToHover.simulate("mouseEnter");
    expect(wrapper.instance().state.hoveredPin).toEqual(17);
    expect(wrapper.find("rect").at(6).props().fill).toEqual(Color.white);
    pinToHover.simulate("mouseLeave");
    expect(pinToHover.props().fill).toEqual(Color.green);
    expect(wrapper.find("rect").at(7).props().fill).toEqual(Color.darkGray);
  });

  it("pin click", () => {
    const p = fakeProps();
    const wrapper = mount(<RpiGpioDiagram {...p} />);
    wrapper.find("rect").at(6).simulate("click");
    expect(p.setSelectedPin).toHaveBeenCalledWith(17);
    jest.clearAllMocks();
    wrapper.find("rect").at(5).simulate("click");
    expect(p.setSelectedPin).not.toHaveBeenCalled();
  });
});
