import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { Point, PointProps } from "../point";
import { INITIAL } from "../../config";
import { clone } from "lodash";
import { fakePoint } from "../../../__test_support__/fake_state/resources";
import { Path } from "../../../internal_urls";
import { Actions } from "../../../constants";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";

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
