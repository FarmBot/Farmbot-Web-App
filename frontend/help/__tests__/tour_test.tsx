jest.mock("../../history", () => ({ history: { push: jest.fn() } }));

import * as React from "react";
import { tourNames, TOUR_STEPS } from "../tours";
import { mount, shallow } from "enzyme";
import { RunTour, Tour } from "../tour";
import { history } from "../../history";
import { CallBackProps } from "react-joyride";

describe("<RunTour />", () => {
  const EMPTY_DIV = "<div></div>";

  it("tour is running", () => {
    const wrapper = mount(<RunTour currentTour={tourNames()[0].name} />);
    expect(wrapper.html()).not.toBe(EMPTY_DIV);
  });

  it("tour is not running", () => {
    const wrapper = mount(<RunTour currentTour={undefined} />);
    expect(wrapper.html()).toBe(EMPTY_DIV);
  });
});

describe("<Tour />", () => {
  console.log = jest.fn();
  const fakeCallbackData = (data: Partial<CallBackProps>): CallBackProps => ({
    action: data.action || "start",
    index: data.index || 0,
    controlled: false,
    lifecycle: "ready",
    size: 0,
    status: "ready",
    step: { target: "", content: "" },
    type: data.type || "tour:start",
  });
  it("ends tour", () => {
    const steps = [TOUR_STEPS()[tourNames()[0].name][0]];
    const wrapper = shallow<Tour>(<Tour steps={steps} />);
    wrapper.instance().callback(fakeCallbackData({ type: "tour:end" }));
    expect(wrapper.state()).toEqual({ run: false, index: 0 });
    expect(history.push).toHaveBeenCalledWith("/app/messages");
  });

  it("navigates through tour: next", () => {
    const steps = TOUR_STEPS()[tourNames()[0].name];
    const wrapper = shallow<Tour>(<Tour steps={steps} />);
    wrapper.instance().callback(
      fakeCallbackData({ action: "next", type: "step:after" }));
    expect(wrapper.state()).toEqual({ run: true, index: 1 });
    expect(history.push).toHaveBeenCalledWith("/app/tools");
  });

  it("navigates through tour: other", () => {
    const steps = [TOUR_STEPS()[tourNames()[0].name][0]];
    const wrapper = shallow<Tour>(<Tour steps={steps} />);
    wrapper.instance().callback(
      fakeCallbackData({ action: "prev", index: 9, type: "step:after" }));
    expect(wrapper.state()).toEqual({ run: true, index: 8 });
    expect(history.push).not.toHaveBeenCalled();
  });
});
