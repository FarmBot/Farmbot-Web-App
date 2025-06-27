import React from "react";
import { mount } from "enzyme";
import {
  getCurrentTourStepBeacons, maybeBeacon, TourStepContainer,
} from "../index";
import { fakeHelpState } from "../../../__test_support__/fake_designer_state";
import { Actions } from "../../../constants";
import { TourStepContainerProps } from "../interfaces";
import { mountWithContext } from "../../../__test_support__/mount_with_context";

describe("<TourStepContainer />", () => {
  const fakeProps = (): TourStepContainerProps => ({
    dispatch: jest.fn(),
    helpState: fakeHelpState(),
    firmwareHardware: undefined,
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
    location.search = "?tour=gettingStarted&tourStep=intro";
    const p = fakeProps();
    p.helpState.currentTour = "gettingStarted";
    p.helpState.currentTourStep = "intro";
    const wrapper = mount(<TourStepContainer {...p} />);
    jest.runAllTimers();
    expect(wrapper.text().toLowerCase()).toContain("getting started");
  });

  it("renders second tour step", () => {
    Object.defineProperty(document, "querySelector", {
      value: () => ({ scrollHeight: 1 }), configurable: true,
    });
    location.search = "?tour=gettingStarted&tourStep=plants";
    const p = fakeProps();
    p.helpState.currentTour = "gettingStarted";
    p.helpState.currentTourStep = "plants";
    const wrapper = mount(<TourStepContainer {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("plants");
    expect(wrapper.find(".message-contents").first().props().style?.height)
      .toEqual(1);
  });

  it("doesn't remove beacon", () => {
    jest.useFakeTimers();
    console.error = jest.fn();
    const element = document.createElement("div");
    element.classList.add("connectivity-button");
    Object.defineProperty(document, "querySelector", {
      value: () => element, configurable: true,
    });
    location.search = "?tour=gettingStarted&tourStep=connectivityPopup";
    const p = fakeProps();
    p.helpState.currentTour = "gettingStarted";
    p.helpState.currentTourStep = "connectivityPopup";
    mount(<TourStepContainer {...p} />);
    expect(element.classList).toContain("beacon");
    jest.runAllTimers();
    expect(element.classList).toContain("beacon");
  });

  it("removes beacon", () => {
    jest.useFakeTimers();
    const element = document.createElement("div");
    element.classList.add("nav-sync");
    Object.defineProperty(document, "querySelector", {
      value: () => element, configurable: true,
    });
    location.search = "?tour=garden&tourStep=cropSearch";
    const p = fakeProps();
    p.helpState.currentTour = "garden";
    p.helpState.currentTourStep = "cropSearch";
    mount(<TourStepContainer {...p} />);
    expect(element.classList).toContain("beacon");
    jest.runAllTimers();
    expect(element.classList).not.toContain("beacon");
  });

  it("handles unknown tour", () => {
    jest.useFakeTimers();
    location.search = "?tour=unknown&tourStep=plants";
    const p = fakeProps();
    p.helpState.currentTour = "unknown";
    p.helpState.currentTourStep = "plants";
    const wrapper = mount(<TourStepContainer {...p} />);
    jest.runAllTimers();
    expect(wrapper.text().toLowerCase())
      .toContain("error: tour step does not exist");
  });

  it("handles unknown step", () => {
    location.search = "?tour=unknown&tourStep=unknown";
    const p = fakeProps();
    p.helpState.currentTour = "unknown";
    p.helpState.currentTourStep = undefined;
    const wrapper = mount(<TourStepContainer {...p} />);
    expect(wrapper.text().toLowerCase())
      .toEqual("error: tour step does not exist");
  });

  it("updates tour state from url", () => {
    location.search = "?tour=gettingStarted&tourStep=intro";
    const p = fakeProps();
    p.helpState.currentTour = undefined;
    p.helpState.currentTourStep = undefined;
    const wrapper = mount(<TourStepContainer {...p} />);
    expectStateUpdate(p.dispatch, "gettingStarted", "intro");
    expect(wrapper.text().toLowerCase()).toContain("getting started");
  });

  it("updates url from tour state", () => {
    location.search = "";
    const p = fakeProps();
    p.helpState.currentTour = "gettingStarted";
    p.helpState.currentTourStep = "intro";
    mountWithContext(<TourStepContainer {...p} />);
    expect(mockNavigate).toHaveBeenCalledWith(
      "?tour=gettingStarted&tourStep=intro");
  });

  it("dispatches", () => {
    location.search = "?tour=monitoring&tourStep=logs";
    const p = fakeProps();
    p.helpState.currentTour = "monitoring";
    p.helpState.currentTourStep = undefined;
    mount(<TourStepContainer {...p} />);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_JOBS_PANEL_OPTION, payload: "logs",
    });
  });

  it("proceeds to next step", () => {
    location.search = "?tour=gettingStarted&tourStep=intro";
    const p = fakeProps();
    p.helpState.currentTour = "gettingStarted";
    p.helpState.currentTourStep = "intro";
    const wrapper = mount(<TourStepContainer {...p} />);
    wrapper.find(".fa-forward.next").simulate("click");
    expectStateUpdate(p.dispatch, "gettingStarted", "plants");
  });

  it("returns to previous step", () => {
    location.search = "?tour=gettingStarted&tourStep=plants";
    const p = fakeProps();
    p.helpState.currentTour = "gettingStarted";
    p.helpState.currentTourStep = "plants";
    const wrapper = mount(<TourStepContainer {...p} />);
    wrapper.find(".fa-backward.previous").simulate("click");
    expectStateUpdate(p.dispatch, "gettingStarted", "intro");
  });

  it("exits tour", () => {
    location.search = "?tour=gettingStarted&tourStep=end";
    const p = fakeProps();
    p.helpState.currentTour = "gettingStarted";
    p.helpState.currentTourStep = "end";
    const wrapper = mount(<TourStepContainer {...p} />);
    wrapper.find(".fa-times").simulate("click");
    expectStateUpdate(p.dispatch, undefined, undefined);
    expect(wrapper.find(".fa-forward.next").hasClass("disabled")).toBeTruthy();
  });

  it("unmounts", () => {
    const element = document.createElement("div");
    element.classList.add("class");
    element.classList.add("beacon");
    Object.defineProperty(document, "querySelector", {
      value: () => element, configurable: true,
    });
    location.search = "?tour=gettingStarted&tourStep=end";
    const p = fakeProps();
    p.helpState.currentTour = "gettingStarted";
    p.helpState.currentTourStep = "end";
    const wrapper = mount(<TourStepContainer {...p} />);
    expect(element.classList).toContain("beacon");
    wrapper.setState({ activeBeacons: ["class"] });
    wrapper.unmount();
    expect(element.classList).not.toContain("beacon");
  });

  it("doesn't find element during unmount", () => {
    Object.defineProperty(document, "querySelector", {
      value: () => undefined, configurable: true,
    });
    location.search = "?tour=gettingStarted&tourStep=end";
    const p = fakeProps();
    p.helpState.currentTour = "gettingStarted";
    p.helpState.currentTourStep = "end";
    const wrapper = mount(<TourStepContainer {...p} />);
    wrapper.setState({ activeBeacons: ["class"] });
    wrapper.unmount();
  });
});

describe("tourStepBeacon()", () => {
  it("returns className", () => {
    location.search = "?tour=gettingStarted&tourStep=plants";
    const state = fakeHelpState();
    state.currentTour = "gettingStarted";
    state.currentTourStep = "plants";
    expect(maybeBeacon("plants", "soft", state)).toEqual("beacon soft");
  });

  it("doesn't return className", () => {
    location.search = "";
    const state = fakeHelpState();
    state.currentTour = undefined;
    state.currentTourStep = undefined;
    expect(maybeBeacon("plants", "soft", state)).toEqual("");
  });
});

describe("getCurrentTourStepBeacons()", () => {
  it("returns current step beacon", () => {
    location.search = "?tour=gettingStarted&tourStep=plants";
    expect(getCurrentTourStepBeacons()).toEqual(["plants", "plant-inventory"]);
  });

  it("doesn't return current step beacon", () => {
    location.search = "?tour=gettingStarted&tourStep=nope";
    expect(getCurrentTourStepBeacons()).toEqual(undefined);
  });

  it("handles unknown tour", () => {
    location.search = "?tour=unknown&tourStep=nope";
    expect(getCurrentTourStepBeacons()).toEqual(undefined);
  });
});
