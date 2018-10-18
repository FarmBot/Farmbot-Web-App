import { helpReducer, HelpState } from "../reducer";
import { Actions } from "../../constants";

describe("helpReducer", () => {
  const fakeState = (): HelpState => ({
    currentTour: undefined,
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
});
