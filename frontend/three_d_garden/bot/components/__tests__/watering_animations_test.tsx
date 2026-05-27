import React from "react";
import { act, render } from "@testing-library/react";
import * as threeFiber from "@react-three/fiber";
import { Texture, TextureLoader } from "three";
import {
  WateringAnimations, WateringAnimationsProps,
} from "../watering_animations";
import { clone } from "lodash";
import { INITIAL, INITIAL_POSITION } from "../../../config";

describe("<WateringAnimations />", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  const fakeProps = (): WateringAnimationsProps => ({
    waterFlow: true,
    config: clone(INITIAL),
    configPosition: clone(INITIAL_POSITION),
    getZ: () => 0,
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
});
