import React from "react";
import TestRenderer from "react-test-renderer";
import { render, cleanup } from "@testing-library/react";
import { Bot, FarmbotModelProps } from "../bot";
import { INITIAL } from "../../config";
import { clone } from "lodash";
import { SVGLoader } from "three/examples/jsm/Addons.js";

describe("<Bot />", () => {
  const mountedWrappers: TestRenderer.ReactTestRenderer[] = [];

  afterEach(() => {
    mountedWrappers.splice(0).forEach(wrapper =>
      TestRenderer.act(() => wrapper.unmount()));
    cleanup();
    jest.useRealTimers();
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
    const { container } = render(<Bot {...p} />);
    expect(container.innerHTML).toContain("bot");
    expect(container.innerHTML).toContain("water-tube");
    const wrapper = TestRenderer.create(<Bot {...p} />);
    mountedWrappers.push(wrapper);
    const slots = wrapper.root.findAll(node => node.props.name == "slot");
    expect(slots[slots.length - 1]?.props.position)
      .toEqual([-1345, 200, 51]);
  });

  it("renders: Jr", () => {
    const p = fakeProps();
    p.config.sizePreset = "Jr";
    p.config.tracks = false;
    p.config.trail = false;
    const { container } = render(<Bot {...p} />);
    expect(container.innerHTML).toContain("bot");
    const wrapper = TestRenderer.create(<Bot {...p} />);
    mountedWrappers.push(wrapper);
    const slots = wrapper.root.findAll(node => node.props.name == "slot");
    expect(slots[slots.length - 1]?.props.position)
      .toEqual([-1345, 100, 51]);
  });

  it("renders: v1.7", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.7";
    const wrapper = TestRenderer.create(<Bot {...p} />);
    mountedWrappers.push(wrapper);
    expect(wrapper.root.findAll(node => node.props.name == "button-group").length)
      .toEqual(15); // 5 * 3
  });

  it("renders: v1.8", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.8";
    const wrapper = TestRenderer.create(<Bot {...p} />);
    mountedWrappers.push(wrapper);
    expect(wrapper.root.findAll(node => node.props.name == "button-group").length)
      .toEqual(9); // 3 * 3
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

  it("loads shapes", () => {
    const p = fakeProps();
    render(<Bot {...p} />);
    expect(SVGLoader.createShapes).toHaveBeenCalledTimes(15);
  });
});
