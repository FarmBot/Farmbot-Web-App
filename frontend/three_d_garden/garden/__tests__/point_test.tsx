import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { DrawnPoint, DrawnPointProps, getDrawnPointData, Point, PointProps } from "../point";
import { INITIAL } from "../../config";
import { clone } from "lodash";
import { fakePoint } from "../../../__test_support__/fake_state/resources";
import { Path } from "../../../internal_urls";
import { Actions } from "../../../constants";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";
import { fakeDesignerState } from "../../../__test_support__/fake_designer_state";
import { Vector3 } from "three";

describe("<Point />", () => {
  const fakeProps = (): PointProps => ({
    config: clone(INITIAL),
    point: fakePoint(),
  });

  it("renders", () => {
    const { container } = render(<Point {...fakeProps()} />);
    expect(container).toContainHTML("cylinder");
  });

  it("navigates to point info", () => {
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    p.point.body.id = 1;
    const { container } = render(<Point {...p} />);
    const point = container.querySelector("[name='marker'");
    point && fireEvent.click(point);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN, payload: true,
    });
    expect(mockNavigate).toHaveBeenCalledWith(Path.points("1"));
  });

  it("doesn't navigate to point info", () => {
    const p = fakeProps();
    p.dispatch = undefined;
    p.point.body.id = 1;
    const { container } = render(<Point {...p} />);
    const point = container.querySelector("[name='marker'");
    point && fireEvent.click(point);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe("getDrawnPointData()", () => {
  it("returns point data", () => {
    location.pathname = Path.mock(Path.weeds("add"));
    const designer = fakeDesignerState();
    designer.drawnWeed = {
      cx: 1, cy: 2, z: 3, color: "red", r: 25,
    };
    const config = clone(INITIAL);
    const expectedPosition = new Vector3(-1360 + 1, -660 + 2, 400 + 3);
    expect(getDrawnPointData(designer, config)).toEqual({
      position: expectedPosition, radius: 25, color: "red",
    });
  });
});

describe("<DrawnPoint />", () => {
  const fakeProps = (): DrawnPointProps => {
    const designer = fakeDesignerState();
    designer.drawnWeed = {
      cx: 1, cy: 2, z: 3, color: "red", r: 25,
    };
    designer.drawnPoint = {
      cx: 10, cy: 20, z: 30, color: "green", r: 15,
    };
    const config = clone(INITIAL);
    return {
      designer,
      usePosition: false,
      config,
    };
  };

  it("draws weed", () => {
    location.pathname = Path.mock(Path.weeds("add"));
    const p = fakeProps();
    const { container } = render(<DrawnPoint {...p} />);
    expect(container).toContainHTML("generic-weed");
    expect(container).toContainHTML("position=\"0,0,0\"");
    expect(container).toContainHTML("scale=\"25\"");
    expect(container).toContainHTML("color=\"red\"");
    expect(container).toContainHTML("opacity=\"0.25\"");
  });
});
