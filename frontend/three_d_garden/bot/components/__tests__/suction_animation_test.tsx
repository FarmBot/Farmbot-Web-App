const mockPosition = { x: 0, y: 0, z: 0, add: jest.fn() };
const mockScaleSet = jest.fn();
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useRef: jest.fn(() => ({
    current: {
      position: mockPosition,
      scale: { set: mockScaleSet },
    },
  })),
}));

import React from "react";
import { render } from "@testing-library/react";
import { SuctionAnimation, SuctionAnimationProps } from "../suction_animation";

describe("<SuctionAnimation />", () => {
  const fakeProps = (): SuctionAnimationProps => ({
    z: -100,
  });

  it("renders", () => {
    render(<SuctionAnimation {...fakeProps()} />);
    expect(mockPosition.add).toHaveBeenCalled();
    expect(mockScaleSet).toHaveBeenCalled();
  });

  it("resets", () => {
    const p = fakeProps();
    p.z = 0;
    render(<SuctionAnimation {...p} />);
    expect(mockPosition.z).toEqual(-100);
  });
});
