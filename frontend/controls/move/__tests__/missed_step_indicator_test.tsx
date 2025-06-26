import React from "react";
import { mount } from "enzyme";
import {
  MissedStepIndicator, MissedStepIndicatorProps, MISSED_STEP_HISTORY_LENGTH,
} from "../missed_step_indicator";
import { range } from "lodash";

describe("<MissedStepIndicator />", () => {
  const fakeProps = (): MissedStepIndicatorProps => ({
    missedSteps: undefined,
    axis: "x",
  });

  it.each<[
    number | undefined, number[] | undefined, string, string, string, string
  ]>([
    [undefined, undefined, "0%", "green", "0%", "green"],
    [0, undefined, "0%", "green", "0%", "green"],
    [10, [90], "10%", "green", "90%", "red"],
    [50, undefined, "50%", "yellow", "50%", "yellow"],
    [50, [80, 0], "50%", "yellow", "80%", "orange"],
    [75, undefined, "75%", "orange", "75%", "orange"],
    [90, undefined, "90%", "red", "90%", "red"],
  ])("renders indicator for %s missed steps", (
    missedSteps, history, instant, instantColor, peak, peakColor,
  ) => {
    const p = fakeProps();
    p.missedSteps = missedSteps;
    const wrapper = mount(<MissedStepIndicator {...p} />);
    history && wrapper.setState({ history });
    expect(wrapper.find(".instant").props().style?.width).toEqual(instant);
    expect(wrapper.find(".instant").hasClass(instantColor)).toEqual(true);
    expect(wrapper.find(".peak").props().style?.marginLeft).toEqual(peak);
    expect(wrapper.find(".peak").hasClass(peakColor)).toEqual(true);
  });

  it("updates missed step history", () => {
    const p = fakeProps();
    const wrapper = mount<MissedStepIndicator>(<MissedStepIndicator {...p} />);
    expect(wrapper.state().history).toEqual([]);
    p.missedSteps = 10;
    wrapper.setProps(p);
    wrapper.instance().componentDidUpdate();
    expect(wrapper.state().history).toEqual([10]);
  });

  it("doesn't update missed step history", () => {
    const p = fakeProps();
    p.missedSteps = 10;
    const wrapper = mount<MissedStepIndicator>(<MissedStepIndicator {...p} />);
    wrapper.instance().componentDidUpdate();
    expect(wrapper.state().history).toEqual([10]);
    wrapper.instance().componentDidUpdate();
    expect(wrapper.state().history).toEqual([10]);
  });

  it("limits missed step history length", () => {
    const p = fakeProps();
    p.missedSteps = 10;
    const wrapper = mount<MissedStepIndicator>(<MissedStepIndicator {...p} />);
    wrapper.setState({ history: range(30) });
    wrapper.instance().componentDidUpdate();
    const start = 30 - MISSED_STEP_HISTORY_LENGTH + 1;
    expect(wrapper.state().history).toEqual(range(start, 30).concat([10]));
  });

  it.each<[
    number | undefined, number[], string, string, string,
  ]>([
    [undefined, [], "latest:0%", "max:0%", "average:0%"],
    [10, [], "latest:10%", "max:10%", "average:10%"],
    [10, [90], "latest:10%", "max:90%", "average:50%"],
    [10, [0, 100], "latest:10%", "max:100%", "average:37%"],
  ])("displays details for history: %s", (
    missedSteps, history, latest, max, average,
  ) => {
    const p = fakeProps();
    p.missedSteps = missedSteps;
    const wrapper = mount(<MissedStepIndicator {...p} />);
    wrapper.setState({ history });
    wrapper.find(".bp6-popover-target").simulate("click");
    ["motor load", latest, max, average].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string.toLowerCase()));
  });

  it("loads history", () => {
    sessionStorage.setItem("missed_step_history_x", "[1,2,3]");
    const wrapper = mount<MissedStepIndicator>(
      <MissedStepIndicator {...fakeProps()} />);
    expect(wrapper.state().history).toEqual([1, 2, 3]);
  });

  it("saves history", () => {
    const wrapper = mount<MissedStepIndicator>(
      <MissedStepIndicator {...fakeProps()} />);
    wrapper.setState({ history: [1, 2, 3] });
    wrapper.unmount();
    expect(sessionStorage.getItem("missed_step_history_x")).toEqual("[1,2,3]");
  });

  it("toggles details", () => {
    const wrapper = mount<MissedStepIndicator>(
      <MissedStepIndicator {...fakeProps()} />);
    wrapper.find(".missed-step-indicator-wrapper").simulate("click");
    expect(wrapper.state().open).toEqual(true);
  });
});
