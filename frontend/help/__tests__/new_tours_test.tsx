jest.mock("../../history", () => ({ push: jest.fn() }));

import React from "react";
import { mount } from "enzyme";
import {
  tourStepBeacon, TourStepContainer, TourStepContainerProps,
} from "../new_tours";
import { fakeHelpState } from "../../__test_support__/fake_designer_state";
import { Actions } from "../../constants";
import { push } from "../../history";

describe("<TourStepContainer />", () => {
  const fakeProps = (): TourStepContainerProps => ({
    dispatch: jest.fn(),
    helpState: fakeHelpState(),
  });

  const expectStateUpdate = (
    dispatch: Function,
    tour: string | undefined,
    tourStep: string | undefined,
  ) => {
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_TOUR, payload: tour,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_TOUR_STEP, payload: tourStep,
    });
  };

  it("renders first tour step", () => {
    location.search = "?tour=gettingStarted?tourStep=intro";
    const p = fakeProps();
    p.helpState.currentNewTour = "gettingStarted";
    p.helpState.currentNewTourStep = "intro";
    const wrapper = mount(<TourStepContainer {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("getting started");
  });

  it("renders second tour step", () => {
    location.search = "?tour=gettingStarted?tourStep=plants";
    const p = fakeProps();
    p.helpState.currentNewTour = "gettingStarted";
    p.helpState.currentNewTourStep = "plants";
    const wrapper = mount(<TourStepContainer {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("plants");
  });

  it("handles unknown step", () => {
    location.search = "?tour=gettingStarted?tourStep=unknown";
    const p = fakeProps();
    p.helpState.currentNewTour = "gettingStarted";
    p.helpState.currentNewTourStep = "unknown";
    const wrapper = mount(<TourStepContainer {...p} />);
    expect(wrapper.text().toLowerCase()).toEqual("");
  });

  it("updates tour state from url", () => {
    location.search = "?tour=gettingStarted?tourStep=intro";
    const p = fakeProps();
    p.helpState.currentNewTour = undefined;
    p.helpState.currentNewTourStep = undefined;
    const wrapper = mount(<TourStepContainer {...p} />);
    expectStateUpdate(p.dispatch, "gettingStarted", "intro");
    expect(wrapper.text().toLowerCase()).toContain("getting started");
  });

  it("updates url from tour state", () => {
    location.search = "";
    const p = fakeProps();
    p.helpState.currentNewTour = "gettingStarted";
    p.helpState.currentNewTourStep = "intro";
    mount(<TourStepContainer {...p} />);
    expect(push).toHaveBeenCalledWith("?tour=gettingStarted?tourStep=intro");
  });

  it("proceeds to next step", () => {
    location.search = "?tour=gettingStarted?tourStep=intro";
    const p = fakeProps();
    p.helpState.currentNewTour = "gettingStarted";
    p.helpState.currentNewTourStep = "intro";
    const wrapper = mount(<TourStepContainer {...p} />);
    wrapper.find(".fa-forward").simulate("click");
    expectStateUpdate(p.dispatch, "gettingStarted", "plants");
  });

  it("exits tour", () => {
    location.search = "?tour=gettingStarted?tourStep=intro";
    const p = fakeProps();
    p.helpState.currentNewTour = "gettingStarted";
    p.helpState.currentNewTourStep = "intro";
    const wrapper = mount(<TourStepContainer {...p} />);
    wrapper.find(".fa-times").simulate("click");
    expectStateUpdate(p.dispatch, undefined, undefined);
  });
});

describe("tourStepBeacon()", () => {
  it("returns className", () => {
    location.search = "?tour=gettingStarted?tourStep=intro";
    expect(tourStepBeacon("intro")).toEqual("beacon");
  });

  it("doesn't return className", () => {
    location.search = "?tourStep=";
    expect(tourStepBeacon("intro")).toEqual("");
  });
});
