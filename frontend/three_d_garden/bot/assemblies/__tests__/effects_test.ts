import React from "react";
import { render } from "@testing-library/react";
import { clone } from "lodash";
import { INITIAL, INITIAL_POSITION } from "../../../config";
import { getBotVersion } from "../../bot_versions";
import {
  EffectsAssembly, EffectsAssemblyProps, effectsAssemblyPropsEqual,
} from "../effects";
import * as wateringAnimationsModule from
  "../../components/watering_animations";

describe("effects dependency matrix", () => {
  const fakeProps = (): EffectsAssemblyProps => ({
    config: clone(INITIAL),
    configPosition: clone(INITIAL_POSITION),
    version: getBotVersion(INITIAL.kitVersion),
    getZ: jest.fn(),
  });
  const move = (
    props: EffectsAssemblyProps,
    axis: keyof typeof props.configPosition,
  ): EffectsAssemblyProps => ({
    ...props,
    configPosition: {
      ...props.configPosition,
      [axis]: props.configPosition[axis] + 1,
    },
  });

  it("ignores motion while all effects are disabled", () => {
    const p = fakeProps();
    expect(effectsAssemblyPropsEqual(p, move(p, "x"))).toBeTruthy();
    expect(effectsAssemblyPropsEqual(p, move(p, "y"))).toBeTruthy();
    expect(effectsAssemblyPropsEqual(p, move(p, "z"))).toBeTruthy();
  });

  it("ignores Z-only motion for v1.9 camera and watering", () => {
    const p = fakeProps();
    p.config.cameraView = true;
    p.config.waterFlow = true;
    p.version = getBotVersion("v1.9");
    expect(effectsAssemblyPropsEqual(p, move(p, "z"))).toBeTruthy();
    expect(effectsAssemblyPropsEqual(p, move(p, "x"))).toBeFalsy();
    expect(effectsAssemblyPropsEqual(p, move(p, "y"))).toBeFalsy();
  });

  it("updates legacy watering and laser for Z movement", () => {
    const p = fakeProps();
    p.config.waterFlow = true;
    p.version = getBotVersion("v1.8");
    expect(effectsAssemblyPropsEqual(p, move(p, "z"))).toBeFalsy();
    p.config.waterFlow = false;
    p.config.laser = true;
    expect(effectsAssemblyPropsEqual(p, move(p, "z"))).toBeFalsy();
  });

  it("positions an enabled laser from the UTM to the soil", () => {
    const p = fakeProps();
    p.config.laser = true;
    p.getZ = jest.fn(() => -25);
    const { container } = render(React.createElement(EffectsAssembly, p));

    expect(container.querySelector("[name='effects-and-diagnostics']"))
      .toBeTruthy();
    expect(p.getZ).toHaveBeenCalledWith(
      p.configPosition.x,
      p.configPosition.y,
    );
  });

  it("positions an enabled camera view relative to the soil", () => {
    const p = fakeProps();
    p.config.cameraView = true;
    p.getZ = jest.fn(() => -25);
    const { container } = render(React.createElement(EffectsAssembly, p));

    expect(container.querySelector("[name='effects-and-diagnostics']"))
      .toBeTruthy();
    expect(p.getZ).toHaveBeenCalled();
  });

  it("renders watering effects", () => {
    const wateringSpy = jest.spyOn(
      wateringAnimationsModule,
      "WateringAnimations",
    ).mockImplementation(() => React.createElement(
      "div",
      { "data-testid": "watering-animations" },
    ));
    const p = fakeProps();
    p.config.waterFlow = true;
    p.getZ = jest.fn(() => -25);
    const { container } = render(React.createElement(EffectsAssembly, p));
    const wateringProps = wateringSpy.mock.calls[0][0];
    wateringSpy.mockRestore();
    expect(container.querySelector("[data-testid='watering-animations']"))
      .toBeTruthy();
    expect(wateringProps).toMatchObject({
      waterFlow: true,
      config: p.config,
      configPosition: p.configPosition,
    });
    wateringProps.getZ(12, 34);
    expect(p.getZ).toHaveBeenCalledWith(12, 34);
  });

  it("updates when non-position effect inputs change", () => {
    const p = fakeProps();
    expect(effectsAssemblyPropsEqual(p, {
      ...p,
      config: clone(p.config),
    })).toBeFalsy();
    expect(effectsAssemblyPropsEqual(p, {
      ...p,
      getZ: () => 0,
    })).toBeFalsy();
    expect(effectsAssemblyPropsEqual(p, {
      ...p,
      version: getBotVersion("v1.8"),
    })).toBeFalsy();
  });

  it("keeps static bounds independent of motion", () => {
    const p = fakeProps();
    p.config.bounds = true;
    expect(effectsAssemblyPropsEqual(p, move(p, "x"))).toBeTruthy();
    p.config.zDimension = true;
    expect(effectsAssemblyPropsEqual(p, move(p, "z"))).toBeFalsy();
  });
});
