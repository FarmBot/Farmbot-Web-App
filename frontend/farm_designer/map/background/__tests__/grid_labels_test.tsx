import React from "react";
import { shallow } from "enzyme";
import {
  calcAxisLabelStepSize,
  generateTransformStyle, GenerateTransformStyleProps,
  gridLabels, GridLabelsProps,
} from "../grid_labels";
import {
  fakeMapTransformProps,
} from "../../../../__test_support__/map_transform_props";
import { Color } from "../../../../ui";

describe("calcAxisLabelStepSize()", () => {
  it("returns step size", () => {
    expect(calcAxisLabelStepSize(1)).toEqual(100);
  });
});

describe("generateTransformStyle()", () => {
  const fakeProps = (): GenerateTransformStyleProps => ({
    zoomLvl: 1,
    mapTransformProps: fakeMapTransformProps(),
  });

  it("returns style", () => {
    expect(generateTransformStyle(fakeProps())).toEqual({
      transform: "scale(1)",
      transformBox: "fill-box",
      transformOrigin: "center",
      transition: "transform 0.2s",
    });
  });
});

describe("gridLabels()", () => {
  const fakeProps = (): GridLabelsProps => ({
    zoomLvl: 1,
    mapTransformProps: fakeMapTransformProps(),
    axis: "x",
    positions: [0],
    fill: Color.darkGray,
  });

  it("renders labels", () => {
    const wrapper = shallow(<g>{gridLabels({ ...fakeProps() })}</g>);
    expect(wrapper.find("TextInRoundedSvgBox").length).toEqual(1);
  });
});
