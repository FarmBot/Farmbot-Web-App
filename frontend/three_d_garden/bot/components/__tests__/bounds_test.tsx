import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { INITIAL, INITIAL_POSITION, PRESETS } from "../../../config";
import { clone } from "lodash";
import { areBoundsPropsEqual, Bounds, BoundsProps } from "../bounds";
import {
  createRenderer, unmountRenderer,
} from "../../../../__test_support__/test_renderer";
import { ControlPillButton } from "../../../controls";

describe("<Bounds />", () => {
  const fakeProps = (): BoundsProps => ({
    config: clone(INITIAL),
    configPosition: clone(INITIAL_POSITION),
  });

  it("skips disabled overlays", () => {
    const { container } = render(<Bounds {...fakeProps()} />);
    expect(container.innerHTML).toEqual("");
  });

  it("renders bounds", () => {
    const p = fakeProps();
    p.config.bounds = true;
    p.onSelectObject = jest.fn();
    const { container } = render(<Bounds {...p} />);
    expect(container).toContainHTML("bounds");
    expect(container).toHaveTextContent("Safe height");
    expect(container).toHaveTextContent("Min soil");
    expect(container).toHaveTextContent("Max soil");
    const wrapper = createRenderer(<Bounds {...p} />);
    wrapper.root.findAllByType(ControlPillButton).forEach(pill => {
      expect(pill.props.rotation)
        .toEqual([Math.PI / 2, Math.PI / 2, 0]);
      pill.props.onClick();
    });
    expect(p.onSelectObject).toHaveBeenCalledTimes(1);
    unmountRenderer(wrapper);
  });

  it("opens the safe height popup", () => {
    const p = fakeProps();
    p.config.bounds = true;
    p.onSelectObject = jest.fn();
    const { container } = render(<Bounds {...p} />);
    const pill = container.querySelector("[name='safe-height-pill']");
    if (!pill) { throw new Error("Safe height pill not found"); }
    fireEvent.pointerDown(pill);
    fireEvent.pointerUp(pill);
    fireEvent.click(pill);
    expect(p.onSelectObject).toHaveBeenCalledWith({
      kind: "safeHeight",
      id: 0,
    });
  });

  it("skips unrelated enabled overlay config churn", () => {
    const p = fakeProps();
    p.config = {
      ...clone(PRESETS["Genesis XL"]),
      bounds: true,
      zDimension: true,
      distanceIndicator: "beamLength",
    };
    const { container, rerender } = render(<Bounds {...p} />);
    const initialHTML = container.innerHTML;

    rerender(<Bounds
      {...p}
      config={{
        ...p.config,
        grid: !p.config.grid,
        stats: !p.config.stats,
      }} />);

    expect(container.innerHTML).toEqual(initialHTML);
  });

  it("updates zDimension when position changes", () => {
    const p = fakeProps();
    p.config = {
      ...clone(PRESETS["Genesis XL"]),
      zDimension: true,
    };
    const { container, rerender } = render(<Bounds {...p} />);
    const initialLabel = container.querySelector(".text")?.textContent;

    rerender(<Bounds
      {...p}
      configPosition={{
        ...p.configPosition,
        z: p.configPosition.z + 100,
      }} />);

    expect(container.querySelector(".text")?.textContent)
      .not.toEqual(initialLabel);
  });

  it("updates distance indicator endpoints when position changes", () => {
    const p = fakeProps();
    p.config = {
      ...clone(PRESETS["Genesis XL"]),
      distanceIndicator: "beamLength",
    };
    const { container, rerender } = render(<Bounds {...p} />);
    const initialPosition = container
      .querySelector("group[position]")
      ?.getAttribute("position");

    rerender(<Bounds
      {...p}
      configPosition={{
        ...p.configPosition,
        x: p.configPosition.x + 100,
      }} />);

    expect(container.querySelector("group[position]")?.getAttribute("position"))
      .not.toEqual(initialPosition);
  });

  it("updates distance indicator endpoints when config changes", () => {
    const p = fakeProps();
    p.config = {
      ...clone(PRESETS["Genesis XL"]),
      distanceIndicator: "beamLength",
    };
    const { container, rerender } = render(<Bounds {...p} />);
    expect(container).toContainHTML("3000mm");

    rerender(<Bounds
      {...p}
      config={{
        ...p.config,
        beamLength: 2000,
      }} />);

    expect(container).toContainHTML("2000mm");
  });

  it("compares position using the active indicator dependencies", () => {
    const p = fakeProps();
    p.config.bounds = true;
    const move = (axis: keyof typeof p.configPosition) => ({
      ...p,
      configPosition: {
        ...p.configPosition,
        [axis]: p.configPosition[axis] + 1,
      },
    });
    expect(areBoundsPropsEqual(p, move("x"))).toBeTruthy();
    expect(areBoundsPropsEqual(p, {
      ...p,
      onSelectObject: jest.fn(),
    })).toBeFalsy();
    p.config.zDimension = true;
    expect(areBoundsPropsEqual(p, move("x"))).toBeTruthy();
    expect(areBoundsPropsEqual(p, move("z"))).toBeFalsy();
    p.config.distanceIndicator = "beamLength";
    expect(areBoundsPropsEqual(p, move("x"))).toBeFalsy();
    expect(areBoundsPropsEqual(p, move("y"))).toBeTruthy();
    p.config.distanceIndicator = "zAxisLength";
    expect(areBoundsPropsEqual(p, move("y"))).toBeFalsy();
  });
});
