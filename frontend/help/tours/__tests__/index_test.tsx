import React from "react";
import { act, fireEvent, render } from "@testing-library/react";
import {
  getCurrentTourStepBeacons, maybeBeacon, TourStepContainer,
} from "../index";
import { fakeHelpState } from "../../../__test_support__/fake_designer_state";
import { Actions } from "../../../constants";
import { TourStepContainerProps } from "../interfaces";
import { renderWithContext } from "../../../__test_support__/mount_with_context";
import { Provider, useDispatch, useSelector } from "react-redux";
import { combineReducers, createStore } from "redux";
import { HelpState, helpReducer } from "../../reducer";
import { NavigationContext } from "../../../routes_helpers";

const originalQuerySelector = document.querySelector.bind(document);

afterEach(() => {
  Object.defineProperty(document, "querySelector", {
    value: originalQuerySelector,
    configurable: true,
  });
});

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
    const { container } = render(<TourStepContainer {...p} />);
    jest.runAllTimers();
    expect(container.textContent?.toLowerCase()).toContain("getting started");
  });

  it("renders second tour step", () => {
    Object.defineProperty(document, "querySelector", {
      value: () => ({ scrollHeight: 1 }), configurable: true,
    });
    location.search = "?tour=gettingStarted&tourStep=plants";
    const p = fakeProps();
    p.helpState.currentTour = "gettingStarted";
    p.helpState.currentTourStep = "plants";
    const { container } = render(<TourStepContainer {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("plants");
    expect((container.querySelector(".message-contents") as HTMLDivElement)
      .style.height).toEqual("1px");
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
    render(<TourStepContainer {...p} />);
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
    render(<TourStepContainer {...p} />);
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
    const { container } = render(<TourStepContainer {...p} />);
    jest.runAllTimers();
    expect(container.textContent?.toLowerCase())
      .toContain("error: tour step does not exist");
  });

  it("handles unknown step", () => {
    location.search = "?tour=unknown&tourStep=unknown";
    const p = fakeProps();
    p.helpState.currentTour = "unknown";
    p.helpState.currentTourStep = undefined;
    const { container } = render(<TourStepContainer {...p} />);
    expect(container.textContent?.toLowerCase()?.trim())
      .toEqual("error: tour step does not exist");
  });

  it("synchronizes the demo tour after the initial render commits", () => {
    jest.useFakeTimers();
    location.search = "?tour=gettingStarted&tourStep=intro";
    const p = fakeProps();
    let committed = false;
    p.dispatch = jest.fn(() => {
      expect(committed).toBe(true);
    });
    const navigate = jest.fn(() => {
      expect(committed).toBe(true);
    });
    const DemoTour = () => {
      React.useLayoutEffect(() => { committed = true; }, []);
      return <NavigationContext.Provider value={navigate}>
        <TourStepContainer {...p} />
      </NavigationContext.Provider>;
    };

    const { rerender } = render(<DemoTour />);
    expectStateUpdate(p.dispatch, "gettingStarted", "intro");
    expect(p.dispatch).toHaveBeenCalledTimes(2);
    expect(navigate).toHaveBeenCalledTimes(1);

    p.helpState = { ...p.helpState };
    rerender(<DemoTour />);
    expect(p.dispatch).toHaveBeenCalledTimes(2);
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it("settles demo tour initialization with a subscribed Redux store", () => {
    jest.useFakeTimers();
    location.search = "?tour=gettingStarted&tourStep=intro";
    const store = createStore(combineReducers({ help: helpReducer }));
    const dispatch = jest.spyOn(store, "dispatch");
    const DemoTour = () => {
      const helpState = useSelector((state: { help: HelpState }) => state.help);
      const tourDispatch = useDispatch();
      return <TourStepContainer
        key={JSON.stringify(helpState)}
        helpState={helpState}
        dispatch={tourDispatch}
        firmwareHardware={undefined} />;
    };

    const { container } = renderWithContext(<Provider store={store}>
      <DemoTour />
    </Provider>);
    expect(store.getState().help).toEqual({
      currentTour: "gettingStarted",
      currentTourStep: "intro",
    });
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(container.textContent?.toLowerCase()).toContain("getting started");

    act(() => {
      store.dispatch({
        type: "MQTT_UPDATE" as Actions,
        payload: undefined,
      });
    });
    expect(dispatch).toHaveBeenCalledTimes(3);
    dispatch.mockRestore();
  });

  it("updates tour state from url", () => {
    location.search = "?tour=gettingStarted&tourStep=intro";
    const p = fakeProps();
    p.helpState.currentTour = undefined;
    p.helpState.currentTourStep = undefined;
    const { container } = render(<TourStepContainer {...p} />);
    expectStateUpdate(p.dispatch, "gettingStarted", "intro");
    expect(container.textContent?.toLowerCase()).toContain("getting started");
  });

  it("updates url from tour state", () => {
    location.search = "";
    const p = fakeProps();
    p.helpState.currentTour = "gettingStarted";
    p.helpState.currentTourStep = "intro";
    renderWithContext(<TourStepContainer {...p} />);
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining("?tour=gettingStarted&tourStep=intro"));
  });

  it("dispatches", () => {
    location.search = "?tour=monitoring&tourStep=logs";
    const p = fakeProps();
    p.helpState.currentTour = "monitoring";
    p.helpState.currentTourStep = undefined;
    render(<TourStepContainer {...p} />);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.OPEN_POPUP, payload: "jobs",
    });
  });

  it("proceeds to next step", () => {
    location.search = "?tour=gettingStarted&tourStep=intro";
    const p = fakeProps();
    p.helpState.currentTour = "gettingStarted";
    p.helpState.currentTourStep = "intro";
    const { container } = render(<TourStepContainer {...p} />);
    fireEvent.click(container.querySelector(".fa-forward.next") as Element);
    expectStateUpdate(p.dispatch, "gettingStarted", "plants");
  });

  it("returns to previous step", () => {
    location.search = "?tour=gettingStarted&tourStep=plants";
    const p = fakeProps();
    p.helpState.currentTour = "gettingStarted";
    p.helpState.currentTourStep = "plants";
    const { container } = render(<TourStepContainer {...p} />);
    fireEvent.click(container.querySelector(".fa-backward.previous") as Element);
    expectStateUpdate(p.dispatch, "gettingStarted", "intro");
  });

  it("exits tour", () => {
    location.search = "?tour=gettingStarted&tourStep=end";
    const p = fakeProps();
    p.helpState.currentTour = "gettingStarted";
    p.helpState.currentTourStep = "end";
    const { container } = render(<TourStepContainer {...p} />);
    fireEvent.click(container.querySelector(".fa-times") as Element);
    expectStateUpdate(p.dispatch, undefined, undefined);
    expect(container.querySelector(".fa-forward.next")?.className)
      .toContain("disabled");
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
    const instance = new TourStepContainer(p);
    instance.state = { ...instance.state, activeBeacons: ["class"] };
    instance.componentWillUnmount();
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
    const instance = new TourStepContainer(p);
    instance.state = { ...instance.state, activeBeacons: ["class"] };
    instance.componentWillUnmount();
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
