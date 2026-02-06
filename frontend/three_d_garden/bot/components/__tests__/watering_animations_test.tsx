import React from "react";
import { act, render } from "@testing-library/react";
jest.mock("../water_stream", () => ({
  WaterStream: jest.fn(() => undefined),
}));
import {
  WateringAnimations, WateringAnimationsProps,
} from "../watering_animations";
import { clone } from "lodash";
import { INITIAL } from "../../../config";
import { WaterStream } from "../water_stream";

afterAll(() => {
  jest.unmock("../water_stream");
});
describe("<WateringAnimations />", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  const fakeProps = (): WateringAnimationsProps => ({
    waterFlow: true,
    config: clone(INITIAL),
    getZ: () => 0,
  });

  it("renders", () => {
    jest.useFakeTimers();
    const p = fakeProps();
    const { container } = render(<WateringAnimations {...p} />);
    act(() => { jest.advanceTimersByTime(60); });
    expect(WaterStream).toHaveBeenCalledTimes(16);
    expect(container.querySelectorAll("[name='waterfall-mist-cloud']").length)
      .toEqual(2);
  });
});
