import React from "react";
import { RpiGpioDiagram, RpiGpioDiagramProps } from "../rpi_gpio_diagram";
import { Color } from "../../../ui";
import {
  actRenderer,
  createRenderer,
  getRendererInstance,
} from "../../../__test_support__/test_renderer";

describe("<RpiGpioDiagram />", () => {
  const fakeProps = (): RpiGpioDiagramProps => ({
    boundPins: [27],
    setSelectedPin: jest.fn(),
    selectedPin: undefined
  });

  it("renders", () => {
    const wrapper = createRenderer(<RpiGpioDiagram {...fakeProps()} />);
    expect(wrapper.root.findAllByType("rect").length).toEqual(42);
  });

  it("pin hover", () => {
    const wrapper = createRenderer(<RpiGpioDiagram {...fakeProps()} />);
    const instance =
      getRendererInstance<RpiGpioDiagram>(wrapper, RpiGpioDiagram);
    const rects = wrapper.root.findAllByType("rect");
    actRenderer(() => {
      rects[5]?.props.onMouseEnter();
    });
    expect(instance.state.hoveredPin).toEqual("GND");
    actRenderer(() => {
      rects[6]?.props.onMouseEnter();
    });
    expect(instance.state.hoveredPin).toEqual(17);
    expect(wrapper.root.findAllByType("rect")[6]?.props.fill).toEqual(Color.white);
    actRenderer(() => {
      rects[6]?.props.onMouseLeave();
    });
    expect(wrapper.root.findAllByType("rect")[6]?.props.fill).toEqual(Color.green);
    expect(wrapper.root.findAllByType("rect")[7]?.props.fill).toEqual(Color.darkGray);
  });

  it("pin click", () => {
    const p = fakeProps();
    const wrapper = createRenderer(<RpiGpioDiagram {...p} />);
    const rects = wrapper.root.findAllByType("rect");
    actRenderer(() => {
      rects[6]?.props.onClick();
    });
    expect(p.setSelectedPin).toHaveBeenCalledWith(17);
    jest.clearAllMocks();
    actRenderer(() => {
      rects[5]?.props.onClick();
    });
    expect(p.setSelectedPin).not.toHaveBeenCalled();
  });
});
