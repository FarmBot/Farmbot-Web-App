import React from "react";
import { mount } from "enzyme";
import { speedOverwrite, SpeedInputRow, getSpeedNode } from "../speed";
import { SpeedInputRowProps } from "../interfaces";

describe("speedOverwrite()", () => {
  it("doesn't return node", () => {
    const node = speedOverwrite("x", undefined);
    expect(node).toEqual([]);
  });
});

describe("<SpeedInputRow />", () => {
  const fakeProps = (): SpeedInputRowProps => ({
    speed: { x: undefined, y: undefined, z: undefined },
    disabledAxes: { x: false, y: false, z: false },
    onCommit: jest.fn(),
    setAxisState: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<SpeedInputRow {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("speed");
  });
});

describe("getSpeedNode()", () => {
  it("returns undefined", () => {
    expect(getSpeedNode(undefined, true)).toEqual(undefined);
  });
});
