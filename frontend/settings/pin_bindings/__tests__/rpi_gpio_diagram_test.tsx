import React from "react";
import TestRenderer from "react-test-renderer";
import { RpiGpioDiagram, RpiGpioDiagramProps } from "../rpi_gpio_diagram";
import { Color } from "../../../ui";

describe("<RpiGpioDiagram />", () => {
  const fakeProps = (): RpiGpioDiagramProps => ({
    boundPins: [27],
    setSelectedPin: jest.fn(),
    selectedPin: undefined
  });

  it("renders", () => {
    const wrapper = TestRenderer.create(<RpiGpioDiagram {...fakeProps()} />);
    expect(wrapper.root.findAllByType("rect").length).toEqual(42);
  });

  it("pin hover", () => {
    const wrapper = TestRenderer.create(<RpiGpioDiagram {...fakeProps()} />);
    const instance = wrapper.getInstance() as RpiGpioDiagram;
    const rects = wrapper.root.findAllByType("rect");
    rects[5]?.props.onMouseEnter();
    expect(instance.state.hoveredPin).toEqual("GND");
    rects[6]?.props.onMouseEnter();
    expect(instance.state.hoveredPin).toEqual(17);
    expect(wrapper.root.findAllByType("rect")[6]?.props.fill).toEqual(Color.white);
    rects[6]?.props.onMouseLeave();
    expect(wrapper.root.findAllByType("rect")[6]?.props.fill).toEqual(Color.green);
    expect(wrapper.root.findAllByType("rect")[7]?.props.fill).toEqual(Color.darkGray);
  });

  it("pin click", () => {
    const p = fakeProps();
    const wrapper = TestRenderer.create(<RpiGpioDiagram {...p} />);
    const rects = wrapper.root.findAllByType("rect");
    rects[6]?.props.onClick();
    expect(p.setSelectedPin).toHaveBeenCalledWith(17);
    jest.clearAllMocks();
    rects[5]?.props.onClick();
    expect(p.setSelectedPin).not.toHaveBeenCalled();
  });
});
