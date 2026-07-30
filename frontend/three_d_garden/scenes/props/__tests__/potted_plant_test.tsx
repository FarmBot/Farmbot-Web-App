import React from "react";
import { render } from "@testing-library/react";
import { PottedPlant, pottedPlantPropsEqual } from "../potted_plant";

describe("<PottedPlant />", () => {
  it("renders", () => {
    const { container } = render(<PottedPlant size={[500, 500, 900]} />);
    expect(container).toContainHTML("pot-with-plant");
  });

  it("centers the sized scene object", () => {
    const { container } = render(<PottedPlant size={[500, 500, 900]} />);
    expect(container.querySelector("group[position='0,0,-450']"))
      .toBeTruthy();
  });

  it("compares potted plant size", () => {
    expect(pottedPlantPropsEqual({ size: [100, 200, 300] }, {
      size: [100, 200, 300],
    })).toBeTruthy();
    expect(pottedPlantPropsEqual({ size: [100, 200, 300] }, {
      size: [100, 200, 301],
    })).toBeFalsy();
  });
});
