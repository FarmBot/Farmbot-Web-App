jest.mock("../../history", () => ({ history: { push: jest.fn() } }));

import * as React from "react";
import { tourNames, TOUR_STEPS } from "../tours";
import { mount, shallow } from "enzyme";
import { RunTour, Tour } from "../tour";
import { history } from "../../history";

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
  it("ends tour", () => {
    const steps = [TOUR_STEPS()[tourNames()[0].name][0]];
    const wrapper = shallow(<Tour steps={steps} />);
    // tslint:disable-next-line:no-any
    const instance = wrapper.instance() as any;
    instance.callback({ action: "", index: 0, step: {}, type: "tour:end" });
    expect(wrapper.state()).toEqual({ run: false, index: 0 });
    expect(history.push).toHaveBeenCalledWith("/app/help");
  });

  it("navigates through tour: next", () => {
    const steps = TOUR_STEPS()[tourNames()[0].name];
    const wrapper = shallow(<Tour steps={steps} />);
    // tslint:disable-next-line:no-any
    const instance = wrapper.instance() as any;
    instance.callback({
      action: "next", index: 0, step: {}, type: "step:after"
    });
    expect(wrapper.state()).toEqual({ run: true, index: 1 });
    expect(history.push).toHaveBeenCalledWith("/app/tools");
  });

  it("navigates through tour: other", () => {
    const steps = [TOUR_STEPS()[tourNames()[0].name][0]];
    const wrapper = shallow(<Tour steps={steps} />);
    // tslint:disable-next-line:no-any
    const instance = wrapper.instance() as any;
    instance.callback({
      action: "prev", index: 9, step: {}, type: "step:after"
    });
    expect(wrapper.state()).toEqual({ run: true, index: 8 });
    expect(history.push).not.toHaveBeenCalled();
  });
});
