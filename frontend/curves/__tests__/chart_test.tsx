jest.mock("../edit_curve", () => ({
  editCurve: jest.fn(),
}));

import { mount } from "enzyme";
import React from "react";
import { Actions } from "../../constants";
import { tagAsSoilHeight } from "../../points/soil_height";
import { fakeBotSize } from "../../__test_support__/fake_bot_data";
import { fakeCurve, fakePoint } from "../../__test_support__/fake_state/resources";
import { CurveIcon, CurveSvg, getWarningLinesContent } from "../chart";
import { editCurve } from "../edit_curve";
import { CurveIconProps, CurveSvgProps } from "../interfaces";
import { Path } from "../../internal_urls";

const TEST_DATA = { 1: 0, 10: 10, 50: 500, 100: 1000 };

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
    const wrapper = mount(<CurveSvg {...p} />);
    expect(wrapper.find("text").length).toEqual(16);
    expect(wrapper.text()).not.toContain("⚠");
    expect(wrapper.html()).toContain("row-resize");
    expect(wrapper.html()).not.toContain("not-allowed");
  });

  it("renders chart: non-editable", () => {
    const p = fakeProps();
    p.curve.body.data = TEST_DATA;
    p.editable = false;
    const wrapper = mount(<CurveSvg {...p} />);
    expect(wrapper.find("text").length).toEqual(16);
    expect(wrapper.html()).not.toContain("row-resize");
  });

  it("renders chart: data full", () => {
    const p = fakeProps();
    p.curve.body.data = {
      1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 12: 12,
    };
    const wrapper = mount(<CurveSvg {...p} />);
    expect(wrapper.find("text").length).toEqual(7);
    expect(wrapper.html()).toContain("not-allowed");
  });

  it("renders chart: max days", () => {
    const p = fakeProps();
    p.curve.body.data = { 1: 0, 200: 100 };
    const wrapper = mount(<CurveSvg {...p} />);
    expect(wrapper.find("text").length).toEqual(16);
  });

  it("hovers bar", () => {
    const p = fakeProps();
    p.editable = true;
    p.curve.body.type = "water";
    p.curve.body.data = TEST_DATA;
    const wrapper = mount<CurveSvgProps>(<CurveSvg {...p} />);
    expect(wrapper.text()).not.toContain("Day 1: 0 mL");
    wrapper.find("rect").at(1).simulate("mouseEnter");
    expect(p.setHovered).toHaveBeenCalledWith("1");
    p.hovered = "1";
    wrapper.setProps(p);
    expect(wrapper.text()).toContain("Day 1: 0 mL");
    wrapper.find("rect").at(1).simulate("mouseLeave");
    expect(p.setHovered).toHaveBeenCalledWith(undefined);
    p.hovered = undefined;
    wrapper.setProps(p);
    expect(wrapper.text()).not.toContain("Day 1: 0 mL");
  });

  it("hovers last bar", () => {
    const p = fakeProps();
    p.editable = false;
    p.curve.body.type = "spread";
    p.curve.body.data = TEST_DATA;
    const wrapper = mount<CurveSvgProps>(<CurveSvg {...p} />);
    expect(wrapper.text()).not.toContain("Day 101+: 1000 mm");
    wrapper.find("rect").last().simulate("mouseEnter");
    expect(p.setHovered).toHaveBeenCalledWith("101");
    p.hovered = "101";
    wrapper.setProps(p);
    expect(wrapper.text()).toContain("Day 101+: 1000 mm");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_SPREAD, payload: 1000,
    });
    wrapper.find("rect").last().simulate("mouseLeave");
    expect(p.setHovered).toHaveBeenCalledWith(undefined);
    p.hovered = undefined;
    wrapper.setProps(p);
    expect(wrapper.text()).not.toContain("Day 101+: 1000 mm");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_SPREAD, payload: undefined,
    });
  });

  it("starts edit", () => {
    const p = fakeProps();
    p.curve.body.data = TEST_DATA;
    const wrapper = mount(<CurveSvg {...p} />);
    wrapper.find("circle").first().simulate("mouseDown");
    wrapper.find("svg").first().simulate("mouseMove", { movementY: -1 });
    expect(editCurve).toHaveBeenCalledWith(p.curve,
      { data: { 1: 5, 10: 10, 50: 500, 100: 1000 } });
    wrapper.find("svg").first().simulate("mouseUp");
    wrapper.find("svg").first().simulate("mouseLeave");
  });

  it("edits to zero", () => {
    const p = fakeProps();
    p.curve.body.data = TEST_DATA;
    const wrapper = mount(<CurveSvg {...p} />);
    wrapper.find("circle").first().simulate("mouseDown");
    wrapper.find("svg").first().simulate("mouseMove", { movementY: 100 });
    expect(editCurve).toHaveBeenCalledWith(p.curve,
      { data: { 1: 0, 10: 10, 50: 500, 100: 1000 } });
  });

  it("doesn't start edit", () => {
    const p = fakeProps();
    p.curve.body.data = TEST_DATA;
    const wrapper = mount(<CurveSvg {...p} />);
    wrapper.find("svg").first().simulate("mouseMove", { movementY: -1 });
    expect(editCurve).not.toHaveBeenCalled();
  });

  it("adds data", () => {
    const p = fakeProps();
    p.curve.body.data = TEST_DATA;
    const wrapper = mount(<CurveSvg {...p} />);
    wrapper.find("circle").last().simulate("mouseEnter");
    wrapper.find("circle").last().simulate("mouseLeave");
    expect(editCurve).toHaveBeenCalledTimes(0);
    wrapper.find("circle").last().simulate("click");
    expect(editCurve).toHaveBeenCalledTimes(1);
    expect(editCurve).toHaveBeenCalledWith(p.curve,
      { data: { 1: 0, 10: 10, 50: 500, 99: 990, 100: 1000 } });
  });

  it("shows warning lines: general spread", () => {
    const p = fakeProps();
    p.curve.body.type = "spread";
    p.botSize.x.value = 100;
    p.botSize.y.value = 200;
    p.curve.body.data = TEST_DATA;
    p.warningLinesContent = getWarningLinesContent(p);
    const wrapper = mount(<CurveSvg {...p} />);
    expect(wrapper.find("text").length).toEqual(18);
    expect(wrapper.text()).toContain("⚠");
    wrapper.find("#warning-icon").first().simulate("mouseEnter");
    expect(p.warningLinesContent.title).toContain("spread beyond");
    wrapper.find("#warning-icon").first().simulate("mouseLeave");
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
    const wrapper = mount(<CurveSvg {...p} />);
    expect(wrapper.find("text").length).toEqual(20);
    expect(wrapper.text()).toContain("⚠");
    wrapper.find("#warning-icon").first().simulate("mouseEnter");
    expect(p.warningLinesContent.title).toContain("spread beyond");
    expect(p.warningLinesContent.lines[0].text).toContain("bleed");
    wrapper.find("#warning-icon").first().simulate("mouseLeave");
  });

  it("shows warning lines: height", () => {
    const p = fakeProps();
    p.curve.body.type = "height";
    p.sourceFbosConfig = () => ({ value: 100, consistent: true });
    p.curve.body.data = TEST_DATA;
    p.warningLinesContent = getWarningLinesContent(p);
    const wrapper = mount(<CurveSvg {...p} />);
    expect(wrapper.find("text").length).toEqual(18);
    expect(wrapper.text()).toContain("⚠");
    wrapper.find("#warning-icon").first().simulate("mouseEnter");
    expect(p.warningLinesContent.title).toContain("exceed the distance");
    wrapper.find("#warning-icon").first().simulate("mouseLeave");
  });

  it("shows warning lines: height in plants panels", () => {
    location.pathname = Path.mock(Path.cropSearch());
    const p = fakeProps();
    p.curve.body.type = "height";
    p.sourceFbosConfig = () => ({ value: 100, consistent: true });
    p.curve.body.data = TEST_DATA;
    p.warningLinesContent = getWarningLinesContent(p);
    const wrapper = mount(<CurveSvg {...p} />);
    expect(wrapper.find("text").length).toEqual(18);
    expect(wrapper.text()).toContain("⚠");
    wrapper.find("#warning-icon").first().simulate("mouseEnter");
    expect(p.warningLinesContent.title).toContain("exceed the distance");
    wrapper.find("#warning-icon").first().simulate("mouseLeave");
  });
});

describe("<CurveIcon />", () => {
  const fakeProps = (): CurveIconProps => ({
    curve: fakeCurve(),
  });

  it("renders curve icon", () => {
    const wrapper = mount(<CurveIcon {...fakeProps()} />);
    expect(wrapper.find("path").length).toEqual(2);
  });
});
