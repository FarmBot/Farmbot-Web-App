import { generateReducer } from "../redux/generate_reducer";
import { Actions } from "../constants";

export interface HelpState {
  currentTour: string | undefined;
  currentTourStep: string | undefined;
}

export const initialState: HelpState = {
  currentTour: undefined,
  currentTourStep: undefined,
};

export const helpReducer = generateReducer<HelpState>(initialState)
  .add<string>(Actions.SET_TOUR, (s, { payload }) => {
    s.currentTour = payload;
    return s;
  })
  .add<string>(Actions.SET_TOUR_STEP, (s, { payload }) => {
    s.currentTourStep = payload;
    return s;
  });
