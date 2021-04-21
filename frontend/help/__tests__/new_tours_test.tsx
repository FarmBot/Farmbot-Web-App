jest.mock("../../history", () => ({ push: jest.fn() }));

import React from "react";
import { mount } from "enzyme";
import {
  getCurrentTourStepBeacons,
  maybeBeacon, TourStepContainer, TourStepContainerProps,
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
    jest.useFakeTimers();
    location.search = "?tour=gettingStarted?tourStep=intro";
    const p = fakeProps();
    p.helpState.currentNewTour = "gettingStarted";
    p.helpState.currentNewTourStep = "intro";
    const wrapper = mount(<TourStepContainer {...p} />);
    jest.runAllTimers();
    expect(wrapper.text().toLowerCase()).toContain("getting started");
  });

  it("renders second tour step", () => {
    Object.defineProperty(document, "querySelector", {
      value: () => ({ scrollHeight: 1 }),
    });
    location.search = "?tour=gettingStarted?tourStep=plants";
    const p = fakeProps();
    p.helpState.currentNewTour = "gettingStarted";
    p.helpState.currentNewTourStep = "plants";
    const wrapper = mount(<TourStepContainer {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("plants");
    expect(wrapper.find(".message-contents").first().props().style?.height)
      .toEqual(1);
  });

  it("handles unknown tour", () => {
    jest.useFakeTimers();
    location.search = "?tour=unknown?tourStep=plants";
    const p = fakeProps();
    p.helpState.currentNewTour = "unknown";
    p.helpState.currentNewTourStep = "plants";
    const wrapper = mount(<TourStepContainer {...p} />);
    jest.runAllTimers();
    expect(wrapper.text().toLowerCase())
      .toContain("error: tour step does not exist");
  });

  it("handles unknown step", () => {
    location.search = "?tour=unknown?tourStep=unknown";
    const p = fakeProps();
    p.helpState.currentNewTour = "unknown";
    p.helpState.currentNewTourStep = undefined;
    const wrapper = mount(<TourStepContainer {...p} />);
    expect(wrapper.text().toLowerCase())
      .toEqual("error: tour step does not exist");
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
    wrapper.find(".fa-forward.next").simulate("click");
    expectStateUpdate(p.dispatch, "gettingStarted", "plants");
  });

  it("returns to previous step", () => {
    location.search = "?tour=gettingStarted?tourStep=plants";
    const p = fakeProps();
    p.helpState.currentNewTour = "gettingStarted";
    p.helpState.currentNewTourStep = "plants";
    const wrapper = mount(<TourStepContainer {...p} />);
    wrapper.find(".fa-backward.previous").simulate("click");
    expectStateUpdate(p.dispatch, "gettingStarted", "intro");
  });

  it("exits tour", () => {
    location.search = "?tour=gettingStarted?tourStep=settings";
    const p = fakeProps();
    p.helpState.currentNewTour = "gettingStarted";
    p.helpState.currentNewTourStep = "settings";
    const wrapper = mount(<TourStepContainer {...p} />);
    wrapper.find(".fa-times").simulate("click");
    expectStateUpdate(p.dispatch, undefined, undefined);
    expect(wrapper.find(".fa-forward.next").hasClass("disabled")).toBeTruthy();
  });
});

describe("tourStepBeacon()", () => {
  it("returns className", () => {
    location.search = "?tour=gettingStarted?tourStep=plants";
    const state = fakeHelpState();
    state.currentNewTour = "gettingStarted";
    state.currentNewTourStep = "plants";
    expect(maybeBeacon("plants", "soft", state)).toEqual("beacon soft");
  });

  it("doesn't return className", () => {
    location.search = "";
    const state = fakeHelpState();
    state.currentNewTour = undefined;
    state.currentNewTourStep = undefined;
    expect(maybeBeacon("plants", "soft", state)).toEqual("");
  });
});

describe("getCurrentTourStepBeacons()", () => {
  it("returns current step beacon", () => {
    location.search = "?tour=gettingStarted?tourStep=plants";
    expect(getCurrentTourStepBeacons()).toEqual(["plants", "plant-inventory"]);
  });

  it("doesn't return current step beacon", () => {
    location.search = "?tour=gettingStarted?tourStep=nope";
    expect(getCurrentTourStepBeacons()).toEqual(undefined);
  });

  it("handles unknown tour", () => {
    location.search = "?tour=unknown?tourStep=nope";
    expect(getCurrentTourStepBeacons()).toEqual(undefined);
  });
});
