import React from "react";
import { render } from "@testing-library/react";
import { Grid, gridLineOffsets, GridProps } from "../grid";
import { INITIAL } from "../../config";
import { clone } from "lodash";

describe("gridLineOffsets()", () => {
  it("calculates offsets", () => {
    expect(gridLineOffsets(50)).toEqual([0, 50]);
    expect(gridLineOffsets(200)).toEqual([0, 100, 200]);
    expect(gridLineOffsets(510)).toEqual([0, 100, 200, 300, 400, 500, 510]);
  });
});

describe("<Grid />", () => {
  const fakeProps = (): GridProps => ({
    config: clone(INITIAL),
    getZ: () => 0,
    activeFocus: "",
  });

  it("renders", () => {
    const p = fakeProps();
    p.config.grid = true;
    const { container } = render(<Grid {...p} />);
    expect(container).toContainHTML("grid");
  });
});
