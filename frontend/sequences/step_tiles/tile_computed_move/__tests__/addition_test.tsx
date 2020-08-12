import React from "react";
import { mount } from "enzyme";
import { axisAddition, OffsetInputRow, VarianceInputRow } from "../addition";
import { OffsetInputRowProps, VarianceInputRowProps } from "../interfaces";

describe("axisAddition()", () => {
  it("doesn't return node", () => {
    const node = axisAddition("x", undefined);
    expect(node).toEqual([]);
  });
});

describe("<OffsetInputRow />", () => {
  const fakeProps = (): OffsetInputRowProps => ({
    offset: { x: undefined, y: undefined, z: undefined },
    disabledAxes: { x: false, y: false, z: false },
    onCommit: jest.fn(),
    setAxisState: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<OffsetInputRow {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("offset");
  });
});

describe("<VarianceInputRow />", () => {
  const fakeProps = (): VarianceInputRowProps => ({
    variance: { x: undefined, y: undefined, z: undefined },
    disabledAxes: { x: false, y: false, z: false },
    onCommit: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<VarianceInputRow {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("variance");
  });
});
