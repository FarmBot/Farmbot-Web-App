jest.mock("../edit_curve", () => ({
  editCurve: jest.fn(),
}));

import { mount } from "enzyme";
import React from "react";
import { fakeBotSize } from "../../__test_support__/fake_bot_data";
import { fakeCurve } from "../../__test_support__/fake_state/resources";
import { CurveSvg } from "../chart";
import { editCurve } from "../edit_curve";
import { CurveSvgProps } from "../interfaces";

const TEST_DATA = { 1: 0, 10: 10, 50: 500, 100: 1000 };

describe("<CurveSvg />", () => {
  const fakeProps = (): CurveSvgProps => ({
    dispatch: jest.fn(),
    curve: fakeCurve(),
    sourceFbosConfig: () => ({ value: 0, consistent: true }),
    botSize: fakeBotSize(),
    editable: true,
  });

  it("renders chart", () => {
    const p = fakeProps();
    p.curve.body.data = TEST_DATA;
    const wrapper = mount(<CurveSvg {...p} />);
    expect(wrapper.find("text").length).toEqual(22);
    expect(wrapper.text()).not.toContain("!");
    expect(wrapper.html()).toContain("row-resize");
    expect(wrapper.html()).not.toContain("not-allowed");
  });

  it("renders chart: non-editable", () => {
    const p = fakeProps();
    p.curve.body.data = TEST_DATA;
    p.editable = false;
    const wrapper = mount(<CurveSvg {...p} />);
    expect(wrapper.find("text").length).toEqual(22);
    expect(wrapper.html()).not.toContain("row-resize");
  });

  it("renders chart: data full", () => {
    const p = fakeProps();
    p.curve.body.data = {
      1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 12: 12,
    };
    const wrapper = mount(<CurveSvg {...p} />);
    expect(wrapper.find("text").length).toEqual(13);
    expect(wrapper.html()).toContain("not-allowed");
  });

  it("renders chart: max days", () => {
    const p = fakeProps();
    p.curve.body.data = { 1: 0, 200: 100 };
    const wrapper = mount(<CurveSvg {...p} />);
    expect(wrapper.find("text").length).toEqual(22);
  });

  it("hovers bar", () => {
    const p = fakeProps();
    p.curve.body.data = TEST_DATA;
    const wrapper = mount(<CurveSvg {...p} />);
    expect(wrapper.text()).not.toContain("Day 1: 0 mL");
    wrapper.find("rect").at(1).simulate("mouseEnter");
    expect(wrapper.text()).toContain("Day 1: 0 mL");
    wrapper.find("rect").at(1).simulate("mouseLeave");
    expect(wrapper.text()).not.toContain("Day 1: 0 mL");
  });

  it("hovers last bar", () => {
    const p = fakeProps();
    p.curve.body.data = TEST_DATA;
    const wrapper = mount(<CurveSvg {...p} />);
    expect(wrapper.text()).not.toContain("Day 101+: 1000 mL");
    wrapper.find("rect").last().simulate("mouseEnter");
    expect(wrapper.text()).toContain("Day 101+: 1000 mL");
    wrapper.find("rect").last().simulate("mouseLeave");
    expect(wrapper.text()).not.toContain("Day 101+: 1000 mL");
  });

  it("starts edit", () => {
    const p = fakeProps();
    p.curve.body.data = TEST_DATA;
    const wrapper = mount(<CurveSvg {...p} />);
    wrapper.find("circle").first().simulate("mouseDown");
    wrapper.find("svg").first().simulate("mouseMove", { movementY: -1 });
    expect(editCurve).toHaveBeenCalledWith(p.curve,
      { data: { 1: 3, 10: 10, 50: 500, 100: 1000 } });
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

  it("shows warning lines: spread", () => {
    const p = fakeProps();
    p.curve.body.type = "spread";
    p.botSize.x.value = 100;
    p.botSize.y.value = 200;
    p.curve.body.data = TEST_DATA;
    const wrapper = mount(<CurveSvg {...p} />);
    expect(wrapper.find("text").length).toEqual(24);
    expect(wrapper.text()).toContain("!");
    wrapper.find("#warning-icon").first().simulate("mouseEnter");
    expect(wrapper.text()).toContain("spread beyond");
    wrapper.find("#warning-icon").first().simulate("mouseLeave");
  });

  it("shows warning lines: height", () => {
    const p = fakeProps();
    p.curve.body.type = "height";
    p.sourceFbosConfig = () => ({ value: 100, consistent: true });
    p.curve.body.data = TEST_DATA;
    const wrapper = mount(<CurveSvg {...p} />);
    expect(wrapper.find("text").length).toEqual(24);
    expect(wrapper.text()).toContain("!");
    wrapper.find("#warning-icon").first().simulate("mouseEnter");
    expect(wrapper.text()).toContain("exceed the distance");
    wrapper.find("#warning-icon").first().simulate("mouseLeave");
  });
});