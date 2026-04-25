import React from "react";
import { render } from "@testing-library/react";
import { Grid, gridLineOffsets, GridProps } from "../grid";
import { INITIAL, PRESETS } from "../../config";
import { clone } from "lodash";
import {
  actRenderer,
  createRenderer,
  unmountRenderer,
} from "../../../__test_support__/test_renderer";

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

  it("refreshes focus material binding when grid dimensions change", () => {
    const p = fakeProps();
    p.config.grid = true;
    const wrapper = createRenderer(<Grid {...p} />);
    const findGridGroup = () => wrapper.root.findAll(node =>
      node.props.name == "garden-grid")[0];
    const genesisBindingKey = findGridGroup().props.materialBindingKey;
    p.config = { ...p.config, ...PRESETS["Genesis XL"] };
    actRenderer(() => {
      wrapper.update(<Grid {...p} />);
    });
    expect(findGridGroup().props.materialBindingKey)
      .not.toEqual(genesisBindingKey);
    unmountRenderer(wrapper);
  });
});
