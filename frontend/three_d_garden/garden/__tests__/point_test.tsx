import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { DrawnPoint, DrawnPointProps, Point, PointProps } from "../point";
import { INITIAL } from "../../config";
import { clone } from "lodash";
import { fakePoint } from "../../../__test_support__/fake_state/resources";
import { Path } from "../../../internal_urls";
import { Actions } from "../../../constants";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";
import {
  fakeDesignerState, fakeDrawnPoint,
} from "../../../__test_support__/fake_designer_state";
import { SpecialStatus } from "farmbot";

describe("<Point />", () => {
  const fakeProps = (): PointProps => ({
    config: clone(INITIAL),
    point: fakePoint(),
    visible: true,
    getZ: () => 0,
  });

  it("renders", () => {
    const { container } = render(<Point {...fakeProps()} />);
    expect(container).toContainHTML("cylinder");
    expect(container).toContainHTML("opacity=\"1\"");
  });

  it("renders: unsaved", () => {
    const p = fakeProps();
    p.point.specialStatus = SpecialStatus.DIRTY;
    const { container } = render(<Point {...p} />);
    expect(container).toContainHTML("cylinder");
    expect(container).not.toContainHTML("opacity=\"1\"");
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

describe("<DrawnPoint />", () => {
  const fakeProps = (): DrawnPointProps => {
    const designer = fakeDesignerState();
    designer.drawnPoint = fakeDrawnPoint();
    const config = clone(INITIAL);
    return {
      designer,
      usePosition: false,
      config,
    };
  };

  it("draws point", () => {
    location.pathname = Path.mock(Path.points("add"));
    const p = fakeProps();
    p.designer.drawnPoint = undefined;
    const { container } = render(<DrawnPoint {...p} />);
    expect(container).toContainHTML("position=\"0,0,0\"");
  });

  it("doesn't draw point", () => {
    location.pathname = Path.mock(Path.points("add"));
    const p = fakeProps();
    p.usePosition = true;
    p.designer.drawnPoint = undefined;
    const { container } = render(<DrawnPoint {...p} />);
    expect(container).not.toContainHTML("position=\"0,0,0\"");
  });

  it("draws weed", () => {
    location.pathname = Path.mock(Path.weeds("add"));
    const p = fakeProps();
    const { container } = render(<DrawnPoint {...p} />);
    expect(container).toContainHTML("generic-weed");
    expect(container).toContainHTML("position=\"0,0,0\"");
    expect(container).toContainHTML("scale=\"30\"");
    expect(container).toContainHTML("color=\"green\"");
    expect(container).toContainHTML("opacity=\"0.25\"");
  });

  it("draws weed: no radius", () => {
    location.pathname = Path.mock(Path.weeds("add"));
    const p = fakeProps();
    const point = fakeDrawnPoint();
    point.r = 0;
    p.designer.drawnPoint = point;
    const { container } = render(<DrawnPoint {...p} />);
    expect(container).toContainHTML("generic-weed");
    expect(container).toContainHTML("position=\"0,0,0\"");
    expect(container).toContainHTML("scale=\"50\"");
    expect(container).toContainHTML("color=\"green\"");
    expect(container).toContainHTML("opacity=\"0.25\"");
  });
});
