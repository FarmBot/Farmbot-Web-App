import React from "react";
import { act, render } from "@testing-library/react";
import * as threeFiber from "@react-three/fiber";
import { Texture, TextureLoader } from "three";
import {
  WateringAnimations, wateringAnimationsPropsEqual,
  WateringAnimationsProps,
} from "../watering_animations";

describe("<WateringAnimations />", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  const fakeProps = (): WateringAnimationsProps => ({
    waterFlow: true,
    nozzlePosition: [10, 20, 200],
    nozzleToSoil: -200,
    nozzleRadius: 9,
  });

  it("renders", () => {
    jest.useFakeTimers();
    const p = fakeProps();
    const { container } = render(<WateringAnimations {...p} />);
    act(() => { jest.advanceTimersByTime(60); });
    expect(container.querySelectorAll("[name^='water-stream-']").length)
      .toEqual(16);
    expect(container.querySelectorAll("[name='waterfall-mist-cloud']").length)
      .toEqual(2);
  });

  it("shares one animated texture across water streams", () => {
    jest.useFakeTimers();
    const loadTextureSpy = jest.spyOn(TextureLoader.prototype, "load")
      .mockImplementation(() => new Texture());
    const useFrameSpy = jest.spyOn(threeFiber, "useFrame")
      .mockImplementation(() => undefined as never);
    const p = fakeProps();
    const { container } = render(<WateringAnimations {...p} />);
    act(() => { jest.advanceTimersByTime(60); });
    expect(container.querySelectorAll("[name^='water-stream-']").length)
      .toEqual(16);
    expect(loadTextureSpy).toHaveBeenCalledTimes(1);
    expect(useFrameSpy.mock.calls.length).toBeLessThan(16);
    loadTextureSpy.mockRestore();
    useFrameSpy.mockRestore();
  });

  it("updates when the nozzle moves or the soil distance changes", () => {
    const previous = fakeProps();
    expect(wateringAnimationsPropsEqual(previous, fakeProps())).toBeTruthy();
    expect(wateringAnimationsPropsEqual(previous, {
      ...previous, nozzlePosition: [10, 20, 201],
    })).toBeFalsy();
    expect(wateringAnimationsPropsEqual(previous, {
      ...previous, nozzleToSoil: -201,
    })).toBeFalsy();
    expect(wateringAnimationsPropsEqual(previous, {
      ...previous, nozzleRadius: 12.5,
    })).toBeFalsy();
    expect(wateringAnimationsPropsEqual(previous, {
      ...previous, waterFlow: false,
    })).toBeFalsy();
  });
});
