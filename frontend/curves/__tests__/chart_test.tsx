import { fireEvent, render } from "@testing-library/react";
import React from "react";
import { Actions } from "../../constants";
import { tagAsSoilHeight } from "../../points/soil_height";
import { fakeBotSize } from "../../__test_support__/fake_bot_data";
import { fakeCurve, fakePoint } from "../../__test_support__/fake_state/resources";
import { CurveIcon, CurveSvg, getWarningLinesContent } from "../chart";
import * as editCurveModule from "../edit_curve";
import { CurveIconProps, CurveSvgProps } from "../interfaces";
import { Path } from "../../internal_urls";

const TEST_DATA = { 1: 0, 10: 10, 50: 500, 100: 1000 };
let editCurveSpy: jest.SpyInstance;

beforeEach(() => {
  location.pathname = Path.mock(Path.designer());
  editCurveSpy = jest.spyOn(editCurveModule, "editCurve")
    .mockImplementation(jest.fn());
});

afterEach(() => {
  editCurveSpy.mockRestore();
});

describe("<CurveSvg />", () => {
  const fakeProps = (): CurveSvgProps => ({
    dispatch: jest.fn(),
    curve: fakeCurve(),
    sourceFbosConfig: () => ({ value: 0, consistent: true }),
    botSize: fakeBotSize(),
    editable: true,
    hovered: undefined,
    setHovered: jest.fn(),
    setOpen: jest.fn(),
    warningLinesContent: { lines: [], title: "" },
  });

  it("renders chart", () => {
    const p = fakeProps();
    p.curve.body.data = TEST_DATA;
    const { container } = render(<CurveSvg {...p} />);
    expect(container.querySelectorAll("text").length).toEqual(16);
    expect(container.textContent).not.toContain("⚠");
    expect(container.innerHTML).toContain("row-resize");
    expect(container.innerHTML).not.toContain("not-allowed");
  });

  it("renders chart: non-editable", () => {
    const p = fakeProps();
    p.curve.body.data = TEST_DATA;
    p.editable = false;
    const { container } = render(<CurveSvg {...p} />);
    expect(container.querySelectorAll("text").length).toEqual(16);
    expect(container.innerHTML).not.toContain("row-resize");
  });

  it("renders chart: data full", () => {
    const p = fakeProps();
    p.curve.body.data = {
      1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 12: 12,
    };
    const { container } = render(<CurveSvg {...p} />);
    expect(container.querySelectorAll("text").length).toEqual(7);
    expect(container.innerHTML).toContain("not-allowed");
  });

  it("renders chart: max days", () => {
    const p = fakeProps();
    p.curve.body.data = { 1: 0, 200: 100 };
    const { container } = render(<CurveSvg {...p} />);
    expect(container.querySelectorAll("text").length).toEqual(16);
  });

  it("hovers bar", () => {
    const p = fakeProps();
    p.editable = true;
    p.curve.body.type = "water";
    p.curve.body.data = TEST_DATA;
    const { container, rerender } = render(<CurveSvg {...p} />);
    expect(container.textContent).not.toContain("Day 1: 0 mL");
    const firstHoverBar = container.querySelectorAll("#hover-bar")[0];
    firstHoverBar && fireEvent.mouseEnter(firstHoverBar);
    expect(p.setHovered).toHaveBeenCalledWith("1");
    p.hovered = "1";
    rerender(<CurveSvg {...p} />);
    expect(container.textContent).toContain("Day 1: 0 mL");
    const firstHoverBarUpdated = container.querySelectorAll("#hover-bar")[0];
    firstHoverBarUpdated && fireEvent.mouseLeave(firstHoverBarUpdated);
    expect(p.setHovered).toHaveBeenCalledWith(undefined);
    p.hovered = undefined;
    rerender(<CurveSvg {...p} />);
    expect(container.textContent).not.toContain("Day 1: 0 mL");
  });

  it("hovers last bar", () => {
    const p = fakeProps();
    p.editable = false;
    p.curve.body.type = "spread";
    p.curve.body.data = TEST_DATA;
    const { container, rerender } = render(<CurveSvg {...p} />);
    expect(container.textContent).not.toContain("Day 101+: 1000 mm");
    const hoverBars = container.querySelectorAll("#hover-bar");
    const lastHoverBar = hoverBars[hoverBars.length - 1];
    lastHoverBar && fireEvent.mouseEnter(lastHoverBar);
    expect(p.setHovered).toHaveBeenCalledWith("101");
    p.hovered = "101";
    rerender(<CurveSvg {...p} />);
    expect(container.textContent).toContain("Day 101+: 1000 mm");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_SPREAD, payload: 1000,
    });
    const updatedHoverBars = container.querySelectorAll("#hover-bar");
    const updatedLastHoverBar = updatedHoverBars[updatedHoverBars.length - 1];
    updatedLastHoverBar && fireEvent.mouseLeave(updatedLastHoverBar);
    expect(p.setHovered).toHaveBeenCalledWith(undefined);
    p.hovered = undefined;
    rerender(<CurveSvg {...p} />);
    expect(container.textContent).not.toContain("Day 101+: 1000 mm");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_SPREAD, payload: undefined,
    });
  });

  it("starts edit", () => {
    const p = fakeProps();
    p.curve.body.data = TEST_DATA;
    const { container } = render(<CurveSvg {...p} />);
    const firstValuePoint = container.querySelector("g#values circle");
    const svg = container.querySelector("svg");
    firstValuePoint && fireEvent.mouseDown(firstValuePoint);
    svg && fireEvent.mouseMove(svg, { movementY: -1 });
    expect(editCurveModule.editCurve).toHaveBeenCalledWith(p.curve,
      { data: { 1: 5, 10: 10, 50: 500, 100: 1000 } });
    svg && fireEvent.mouseUp(svg);
    svg && fireEvent.mouseLeave(svg);
  });

  it("edits to zero", () => {
    const p = fakeProps();
    p.curve.body.data = TEST_DATA;
    const { container } = render(<CurveSvg {...p} />);
    const firstValuePoint = container.querySelector("g#values circle");
    const svg = container.querySelector("svg");
    firstValuePoint && fireEvent.mouseDown(firstValuePoint);
    svg && fireEvent.mouseMove(svg, { movementY: 100 });
    expect(editCurveModule.editCurve).toHaveBeenCalledWith(p.curve,
      { data: { 1: 0, 10: 10, 50: 500, 100: 1000 } });
  });

  it("doesn't start edit", () => {
    const p = fakeProps();
    p.curve.body.data = TEST_DATA;
    const { container } = render(<CurveSvg {...p} />);
    const svg = container.querySelector("svg");
    svg && fireEvent.mouseMove(svg, { movementY: -1 });
    expect(editCurveModule.editCurve).not.toHaveBeenCalled();
  });

  it("adds data", () => {
    const p = fakeProps();
    p.curve.body.data = TEST_DATA;
    const { container } = render(<CurveSvg {...p} />);
    const circles = container.querySelectorAll("g#other-values circle");
    const lastCircle = circles[circles.length - 1];
    lastCircle && fireEvent.mouseEnter(lastCircle);
    lastCircle && fireEvent.mouseLeave(lastCircle);
    expect(editCurveModule.editCurve).toHaveBeenCalledTimes(0);
    lastCircle && fireEvent.click(lastCircle);
    expect(editCurveModule.editCurve).toHaveBeenCalledTimes(1);
    expect(editCurveModule.editCurve).toHaveBeenCalledWith(p.curve,
      { data: { 1: 0, 10: 10, 50: 500, 99: 990, 100: 1000 } });
  });

  it("shows warning lines: general spread", () => {
    const p = fakeProps();
    p.curve.body.type = "spread";
    p.botSize.x.value = 100;
    p.botSize.y.value = 200;
    p.curve.body.data = TEST_DATA;
    p.warningLinesContent = getWarningLinesContent(p);
    const { container } = render(<CurveSvg {...p} />);
    expect(container.querySelectorAll("text").length).toEqual(18);
    expect(container.textContent).toContain("⚠");
    const warningIcon = container.querySelector("#warning-icon");
    warningIcon && fireEvent.mouseEnter(warningIcon);
    expect(p.warningLinesContent.title).toContain("spread beyond");
    warningIcon && fireEvent.mouseLeave(warningIcon);
  });

  it("shows warning lines: spread at location", () => {
    const p = fakeProps();
    p.x = 100;
    p.y = 200;
    const point0 = fakePoint();
    point0.body.x = 500;
    point0.body.y = 500;
    point0.body.z = 400;
    tagAsSoilHeight(point0);
    const point1 = fakePoint();
    point1.body.x = 0;
    point1.body.y = 0;
    point1.body.z = 100;
    tagAsSoilHeight(point1);
    p.soilHeightPoints = [point0, point1];
    p.farmwareEnvs = [];
    p.curve.body.type = "spread";
    p.botSize.x.value = 2000;
    p.botSize.y.value = 1000;
    p.curve.body.data = TEST_DATA;
    p.warningLinesContent = getWarningLinesContent(p);
    const { container } = render(<CurveSvg {...p} />);
    expect(container.querySelectorAll("text").length).toEqual(20);
    expect(container.textContent).toContain("⚠");
    const warningIcon = container.querySelector("#warning-icon");
    warningIcon && fireEvent.mouseEnter(warningIcon);
    expect(p.warningLinesContent.title).toContain("spread beyond");
    expect(p.warningLinesContent.lines[0].text).toContain("bleed");
    warningIcon && fireEvent.mouseLeave(warningIcon);
  });

  it("shows warning lines: height", () => {
    const p = fakeProps();
    p.curve.body.type = "height";
    p.sourceFbosConfig = () => ({ value: 100, consistent: true });
    p.curve.body.data = TEST_DATA;
    p.warningLinesContent = getWarningLinesContent(p);
    const { container } = render(<CurveSvg {...p} />);
    expect(container.querySelectorAll("text").length).toEqual(18);
    expect(container.textContent).toContain("⚠");
    const warningIcon = container.querySelector("#warning-icon");
    warningIcon && fireEvent.mouseEnter(warningIcon);
    expect(p.warningLinesContent.title).toContain("exceed the distance");
    warningIcon && fireEvent.mouseLeave(warningIcon);
  });

  it("shows warning lines: height in plants panels", () => {
    location.pathname = Path.mock(Path.cropSearch());
    const p = fakeProps();
    p.curve.body.type = "height";
    p.sourceFbosConfig = () => ({ value: 100, consistent: true });
    p.curve.body.data = TEST_DATA;
    p.warningLinesContent = getWarningLinesContent(p);
    const { container } = render(<CurveSvg {...p} />);
    expect(container.querySelectorAll("text").length).toEqual(18);
    expect(container.textContent).toContain("⚠");
    const warningIcon = container.querySelector("#warning-icon");
    warningIcon && fireEvent.mouseEnter(warningIcon);
    expect(p.warningLinesContent.title).toContain("exceed the distance");
    warningIcon && fireEvent.mouseLeave(warningIcon);
  });
});

describe("<CurveIcon />", () => {
  const fakeProps = (): CurveIconProps => ({
    curve: fakeCurve(),
  });

  it("renders curve icon", () => {
    const { container } = render(<CurveIcon {...fakeProps()} />);
    expect(container.querySelectorAll("path").length).toEqual(2);
  });
});
