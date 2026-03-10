import React from "react";
import { render } from "@testing-library/react";
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
    const { container } = render(<OffsetInputRow {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).toContain("offset");
  });
});

describe("<VarianceInputRow />", () => {
  const fakeProps = (): VarianceInputRowProps => ({
    variance: { x: undefined, y: undefined, z: undefined },
    disabledAxes: { x: false, y: false, z: false },
    onCommit: jest.fn(),
  });

  it("renders", () => {
    const { container } = render(<VarianceInputRow {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).toContain("variance");
  });
});
