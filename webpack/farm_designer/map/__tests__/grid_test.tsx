import * as React from "react";
import { Grid } from "../grid";
import { shallow } from "enzyme";
import { GridProps } from "../interfaces";
import { fakeMapTransformProps } from "../../../__test_support__/map_transform_props";

describe("<Grid/>", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  function fakeProps(): GridProps {
    return {
      mapTransformProps: fakeMapTransformProps(),
      dispatch: jest.fn(),
      onClick: jest.fn()
    };
  }

  it("renders grid", () => {
    const wrapper = shallow(<Grid {...fakeProps()} />);
    expect(wrapper.find("#major-grid").props().width).toEqual(3000);
    expect(wrapper.find("#minor-grid").props().width).toEqual(3000);
    expect(wrapper.find("#axis-arrows").find("line").first().props())
      .toEqual({ x1: 0, x2: 25, y1: 0, y2: 0 });
    expect(wrapper.find("#axis-values").find("text").length).toEqual(43);
  });

});
