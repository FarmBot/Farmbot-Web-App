import React from "react";
import { render } from "@testing-library/react";
import {
  WateringAnimations, WateringAnimationsProps,
} from "../watering_animations";

describe("<WateringAnimations />", () => {
  const fakeProps = (): WateringAnimationsProps => ({
    waterFlow: true,
    botPosition: { x: 0, y: 0, z: 0 },
    getZ: () => 0,
  });

  it("renders", () => {
    const p = fakeProps();
    const { container } = render(<WateringAnimations {...p} />);
    const streams = container.querySelectorAll("[name*='water-stream']");
    expect(streams.length).toEqual(16);

    const clouds = container.querySelectorAll("[name*='waterfall-mist-cloud']");
    expect(clouds.length).toEqual(2);
  });
});
