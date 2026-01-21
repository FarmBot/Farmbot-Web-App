import React from "react";
import { mount } from "enzyme";
import { render } from "@testing-library/react";
import { Bot, FarmbotModelProps } from "../bot";
import { Tools } from "../components";
import { INITIAL } from "../../config";
import { clone } from "lodash";
import { SVGLoader } from "three/examples/jsm/Addons";

describe("<Bot />", () => {
  beforeEach(() => {
    (SVGLoader.createShapes as jest.Mock).mockClear();
  });

  const fakeProps = (): FarmbotModelProps => {
    const config = clone(INITIAL);
    config.bot = true;
    config.tracks = true;
    config.cableCarriers = true;
    return {
      config,
      activeFocus: "",
      getZ: jest.fn(),
    };
  };

  it("renders", () => {
    const p = fakeProps();
    p.config.sizePreset = "Genesis";
    p.config.tracks = true;
    p.config.trail = true;
    p.config.kitVersion = "v1.n";
    const wrapper = mount(<Bot {...p} />);
    expect(wrapper.html()).toContain("bot");
    expect(wrapper.html()).toContain("water-tube");
    expect(wrapper.find({ name: "slot" }).last().props().position)
      .toEqual([-1345, 200, 51]);
  });

  it("renders: Jr", () => {
    const p = fakeProps();
    p.config.sizePreset = "Jr";
    p.config.tracks = false;
    p.config.trail = false;
    const wrapper = mount(<Bot {...p} />);
    expect(wrapper.html()).toContain("bot");
    expect(wrapper.find({ name: "slot" }).last().props().position)
      .toEqual([-1345, 100, 51]);
  });

  it("renders: v1.7", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.7";
    const wrapper = mount(<Bot {...p} />);
    expect(wrapper.find({ name: "button-group" }).length).toEqual(15); // 5 * 3
  });

  it("renders: v1.8", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.8";
    const wrapper = mount(<Bot {...p} />);
    expect(wrapper.find({ name: "button-group" }).length).toEqual(9); // 3 * 3
  });

  it("passes labels config to tools", () => {
    const p = fakeProps();
    p.config.labels = true;
    p.config.labelsOnHover = true;
    const wrapper = mount(<Bot {...p} />);
    const tools = wrapper.find(Tools).first();
    expect(tools.props().config.labels).toEqual(true);
    expect(tools.props().config.labelsOnHover).toEqual(true);
  });

  it("renders watering animation", () => {
    const p = fakeProps();
    p.config.waterFlow = true;
    jest.useFakeTimers();
    const { container, rerender } = render(<Bot {...p} />);
    jest.runAllTimers();
    rerender(<Bot {...p} />);
    expect(container).toContainHTML("watering-animations");
  });

  it("renders camera view", () => {
    const p = fakeProps();
    p.getZ = jest.fn(() => 0);
    p.config.cameraView = true;
    const { container } = render(<Bot {...p} />);
    expect(container).toContainHTML("camera-view");
  });

  it("loads shapes", () => {
    const p = fakeProps();
    render(<Bot {...p} />);
    expect(SVGLoader.createShapes).toHaveBeenCalledTimes(15);
  });

  it("doesn't reload shapes when cached", () => {
    const p = fakeProps();
    const { rerender } = render(<Bot {...p} />);
    const calls = (SVGLoader.createShapes as jest.Mock).mock.calls.length;
    rerender(<Bot {...p} />);
    expect(SVGLoader.createShapes).toHaveBeenCalledTimes(calls);
  });
});
