import { helpReducer, HelpState } from "../reducer";
import { Actions } from "../../constants";

describe("helpReducer", () => {
  const fakeState = (): HelpState => ({
    currentTour: undefined,
    currentNewTour: undefined,
    currentNewTourStep: undefined,
  });

  it("changes current tour", () => {
    const oldState = fakeState();
    oldState.currentTour = "aTour";
    const newState = helpReducer(oldState, {
      type: Actions.START_TOUR,
      payload: undefined
    });
    expect(oldState.currentTour).not.toEqual(newState.currentTour);
    expect(newState.currentTour).toBeUndefined();
  });

  it("changes current new tour", () => {
    const oldState = fakeState();
    oldState.currentNewTour = "aTour";
    const newState = helpReducer(oldState, {
      type: Actions.SET_TOUR,
      payload: undefined
    });
    expect(oldState.currentNewTour).not.toEqual(newState.currentNewTour);
    expect(newState.currentNewTour).toBeUndefined();
  });

  it("changes current new tour step", () => {
    const oldState = fakeState();
    oldState.currentNewTourStep = "aTourStep";
    const newState = helpReducer(oldState, {
      type: Actions.SET_TOUR_STEP,
      payload: undefined
    });
    expect(oldState.currentNewTourStep).not.toEqual(newState.currentNewTourStep);
    expect(newState.currentNewTourStep).toBeUndefined();
  });
});
