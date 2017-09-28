const mockHistory = jest.fn();
jest.mock("../../../history", () => ({
  history: {
    push: mockHistory,
    getCurrentLocation: jest.fn()
      .mockImplementationOnce(() => {
        return { pathname: "/app/designer/plants" };
      })
      .mockImplementationOnce(() => {
        return { pathname: "/app/designer/plants/1/edit" };
      })
      .mockImplementationOnce(() => {
        return { pathname: "/app/designer/plants/1" };
      })
  }
}));

import * as React from "react";
import { Grid } from "../grid";
import { shallow } from "enzyme";
import { GridProps } from "../interfaces";

describe("<Grid/>", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  function fakeProps(): GridProps {
    return {
      mapTransformProps: {
        quadrant: 2, gridSize: { x: 3000, y: 1500 }
      },
      dispatch: jest.fn()
    };
  }

  it("renders grid", () => {
    const wrapper = shallow(<Grid {...fakeProps() } />);
    expect(wrapper.find("#major-grid").props().width).toEqual(3000);
    expect(wrapper.find("#minor-grid").props().width).toEqual(3000);
    expect(wrapper.find("#axis-arrows").find("line").first().props())
      .toEqual({ x1: 0, x2: 25, y1: 0, y2: 0 });
    expect(wrapper.find("#axis-values").find("text").length).toEqual(43);
  });

  it("closes plant info", () => {
    const p = fakeProps();
    const wrapper = shallow(<Grid {...p } />);
    const gridArea = wrapper.find("g").first();
    gridArea.simulate("click"); // no plant info open
    expect(mockHistory).not.toHaveBeenCalled();
    expect(p.dispatch).not.toHaveBeenCalled();
    gridArea.simulate("click"); // plant edit open
    expect(mockHistory).not.toHaveBeenCalled();
    expect(p.dispatch).not.toHaveBeenCalled();
    gridArea.simulate("click"); // plant info open
    expect(mockHistory).toHaveBeenCalledWith("/app/designer/plants");
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: undefined, type: "SELECT_PLANT"
    });
  });

});
