import React from "react";
import { render } from "@testing-library/react";
import { Bot, FarmbotModelProps } from "../bot";
import { INITIAL } from "../../config";
import { clone } from "lodash";
import { SVGLoader } from "three/examples/jsm/Addons.js";

describe("<Bot />", () => {
  afterEach(() => {
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
    expect(container).toContainHTML("bot");
    expect(container).toContainHTML("water-tube");
    const slots = container.querySelectorAll("[name='slot']");
    const lastSlot = slots[slots.length - 1];
    expect(lastSlot?.getAttribute("position")?.replace(/\s+/g, ""))
      .toContain("-1345,200,51");
  });

  it("renders: Jr", () => {
    const p = fakeProps();
    p.config.sizePreset = "Jr";
    p.config.tracks = false;
    p.config.trail = false;
    const { container } = render(<Bot {...p} />);
    expect(container).toContainHTML("bot");
    const slots = container.querySelectorAll("[name='slot']");
    const lastSlot = slots[slots.length - 1];
    expect(lastSlot?.getAttribute("position")?.replace(/\s+/g, ""))
      .toContain("-1345,100,51");
  });

  it("renders: v1.7", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.7";
    const { container } = render(<Bot {...p} />);
    expect(container.querySelectorAll("[name='button-group']").length).toEqual(5);
  });

  it("renders: v1.8", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.8";
    const { container } = render(<Bot {...p} />);
    expect(container.querySelectorAll("[name='button-group']").length).toEqual(3);
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
