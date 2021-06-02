import { helpReducer, HelpState } from "../reducer";
import { Actions } from "../../constants";

describe("helpReducer", () => {
  const fakeState = (): HelpState => ({
    currentTour: undefined,
    currentTourStep: undefined,
  });

  it("changes current tour", () => {
    const oldState = fakeState();
    oldState.currentTour = "aTour";
    const newState = helpReducer(oldState, {
      type: Actions.SET_TOUR,
      payload: undefined
    });
    expect(oldState.currentTour).not.toEqual(newState.currentTour);
    expect(newState.currentTour).toBeUndefined();
  });

  it("changes current tour step", () => {
    const oldState = fakeState();
    oldState.currentTourStep = "aTourStep";
    const newState = helpReducer(oldState, {
      type: Actions.SET_TOUR_STEP,
      payload: undefined
    });
    expect(oldState.currentTourStep).not.toEqual(newState.currentTourStep);
    expect(newState.currentTourStep).toBeUndefined();
  });
});
