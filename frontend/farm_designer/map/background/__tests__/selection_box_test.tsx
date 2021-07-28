import React from "react";
import {
  getSelectionBoxArea, SelectionBox, SelectionBoxProps,
} from "../selection_box";
import { shallow } from "enzyme";
import {
  fakeMapTransformProps,
} from "../../../../__test_support__/map_transform_props";

describe("<SelectionBox/>", () => {
  function fakeProps(): SelectionBoxProps {
    return {
      selectionBox: {
        x0: 40,
        y0: 30,
        x1: 240,
        y1: 130
      },
      mapTransformProps: fakeMapTransformProps(),
    };
  }

  it("renders selection box", () => {
    const wrapper = shallow(<SelectionBox {...fakeProps()} />);
    const boxProps = wrapper.find("rect").props();
    expect(boxProps.x).toEqual(40);
    expect(boxProps.y).toEqual(30);
    expect(boxProps.width).toEqual(200);
    expect(boxProps.height).toEqual(100);
  });

  it("doesn't render selection box: partially undefined", () => {
    const p = fakeProps();
    p.selectionBox = { x0: 1, y0: 2, x1: undefined, y1: 4 };
    const wrapper = shallow(<SelectionBox {...p} />);
    expect(wrapper.html()).toEqual("<g id=\"selection-box\"></g>");
  });

  it("renders selection box: quadrant 4", () => {
    const p = fakeProps();
    p.mapTransformProps.quadrant = 4;
    const wrapper = shallow(<SelectionBox {...p} />);
    const boxProps = wrapper.find("rect").props();
    expect(boxProps.x).toEqual(2760);
    expect(boxProps.y).toEqual(1370);
    expect(boxProps.width).toEqual(200);
    expect(boxProps.height).toEqual(100);
  });
});

describe("getSelectionBoxArea()", () => {
  it("returns correct area", () => {
    expect(getSelectionBoxArea(undefined)).toEqual(0);
    expect(getSelectionBoxArea({ x0: 1, y0: 1, x1: undefined, y1: undefined }))
      .toEqual(0);
    expect(getSelectionBoxArea({ x0: 0, y0: 0, x1: 10, y1: 10 })).toEqual(100);
  });
});
