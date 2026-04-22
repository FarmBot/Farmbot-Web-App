const mockPosition = { x: 0, y: 0, z: 0, add: jest.fn() };
const mockScaleSet = jest.fn();

import React from "react";
import * as threeFiber from "@react-three/fiber";
import { render } from "@testing-library/react";
import { SuctionAnimation, SuctionAnimationProps } from "../suction_animation";

describe("<SuctionAnimation />", () => {
  beforeEach(() => {
    jest.spyOn(threeFiber, "useFrame")
      .mockImplementation(((callback, _renderPriority) => {
        callback({} as never, 0, undefined);
        // eslint-disable-next-line no-null/no-null
        return null;
      }));
    jest.spyOn(React, "useRef").mockReturnValue({
      current: {
        position: mockPosition,
        scale: { set: mockScaleSet },
      },
    });
    mockPosition.x = 0;
    mockPosition.y = 0;
    mockPosition.z = 0;
    mockPosition.add.mockClear();
    mockScaleSet.mockClear();
  });


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
