import React from "react";
import { render } from "@testing-library/react";
import { Arrow, arrowPropsEqual, ArrowProps } from "../arrow";

describe("<Arrow />", () => {
  const fakeProps = (): ArrowProps => ({
    length: 10,
    width: 5,
  });

  it("renders", () => {
    const { container } = render(<Arrow {...fakeProps()} />);
    expect(container.innerHTML).toContain("extrude");
  });

  it("compares rendered arrow inputs", () => {
    const p = fakeProps();
    expect(arrowPropsEqual(p, {
      ...p,
      rotation: undefined,
    })).toBeTruthy();
    expect(arrowPropsEqual({
      ...p,
      rotation: [0, 0, Math.PI / 2],
    }, {
      ...p,
      rotation: [0, 0, Math.PI / 2],
    })).toBeTruthy();
    expect(arrowPropsEqual(p, {
      ...p,
      length: p.length + 1,
    })).toBeFalsy();
    expect(arrowPropsEqual({
      ...p,
      rotation: [0, 0, Math.PI / 2],
    }, {
      ...p,
      rotation: [0, 0, Math.PI],
    })).toBeFalsy();
  });
});
