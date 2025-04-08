import React from "react";
import { render } from "@testing-library/react";
import {
  WateringAnimations, WateringAnimationsProps,
} from "../watering_animations";

describe("<WateringAnimations />", () => {
  const fakeProps = (): WateringAnimationsProps => ({
    waterFlow: true,
    botPositionZ: 100,
    soilHeight: 0,
  });

  it("renders", () => {
    const p = fakeProps();
    p.botPositionZ = 200;
    p.soilHeight = 50;
    const { container } = render(<WateringAnimations {...p} />);
    const streams = container.querySelectorAll("[name*='water-stream']");
    expect(streams.length).toEqual(16);

    const clouds = container.querySelectorAll("[name*='waterfall-mist-cloud']");
    expect(clouds.length).toEqual(2);
  });
});
