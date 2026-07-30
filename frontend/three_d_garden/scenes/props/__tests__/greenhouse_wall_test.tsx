import React from "react";
import { render } from "@testing-library/react";
import { GreenhouseWall } from "../greenhouse_wall";
import { BoxGeometry } from "../../../components";
import {
  createRenderer, unmountRenderer,
} from "../../../../__test_support__/test_renderer";

describe("<GreenhouseWall />", () => {
  it("renders", () => {
    const { container } = render(<GreenhouseWall size={[10000, 10, 2500]} />);
    expect(container).toContainHTML("greenhouse-wall");
  });

  it("uses instanced meshes for panes and frames", () => {
    const { container } = render(<GreenhouseWall size={[10000, 10, 2500]} />);
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
    expect(instances.map(instance => instance.getAttribute("frustumCulled")))
      // eslint-disable-next-line no-null/no-null
      .toEqual([null, null, null]);
  });

  it("uses size to set frame size and panel counts", () => {
    const { container } = render(<GreenhouseWall size={[20000, 20, 5000]} />);
    const instances = Array.from(container.querySelectorAll("instancedmesh"));
    const wrapper = createRenderer(<GreenhouseWall size={[20000, 20, 5000]} />);
    const geometries = wrapper.root.findAllByType(BoxGeometry);

    expect(instances.map(instance => instance.getAttribute("count"))).toEqual([
      "128",
      "18",
      "10",
    ]);
    expect(geometries.map(geometry => geometry.props.args)).toEqual([
      [1227.5, 20, 600],
      [20, 20, 5000],
      [20000, 20, 20],
    ]);
    unmountRenderer(wrapper);
  });

  it("fills partial pane rows and columns", () => {
    const { container } = render(<GreenhouseWall size={[20500, 20, 5500]} />);
    const instances = Array.from(container.querySelectorAll("instancedmesh"));

    expect(instances.map(instance => instance.getAttribute("count"))).toEqual([
      "153",
      "18",
      "10",
    ]);
  });

  it("memoizes the static wall subtree", () => {
    const memoized = GreenhouseWall as unknown as { $$typeof: symbol };
    expect(memoized.$$typeof.toString()).toContain("react.memo");
  });
});
