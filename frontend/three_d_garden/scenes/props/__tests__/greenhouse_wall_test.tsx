import React from "react";
import { render } from "@testing-library/react";
import { GreenhouseWall } from "../greenhouse_wall";

describe("<GreenhouseWall />", () => {
  it("renders", () => {
    const { container } = render(<GreenhouseWall />);
    expect(container).toContainHTML("greenhouse-wall");
  });

  it("uses instanced meshes for panes and frames", () => {
    const { container } = render(<GreenhouseWall />);
    const instances = Array.from(container.querySelectorAll("instancedmesh"));
    expect(instances.map(instance => instance.getAttribute("name"))).toEqual([
      "greenhouse-wall-panes",
      "greenhouse-wall-vertical-frames",
      "greenhouse-wall-horizontal-frames",
    ]);
    expect(instances.map(instance => instance.getAttribute("count"))).toEqual([
      "32",
      "9",
      "5",
    ]);
  });

  it("memoizes the static wall subtree", () => {
    const memoized = GreenhouseWall as unknown as { $$typeof: symbol };
    expect(memoized.$$typeof.toString()).toContain("react.memo");
  });
});
