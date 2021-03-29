import { generateReducer } from "../redux/generate_reducer";
import { Actions } from "../constants";

export interface HelpState {
  currentTour: string | undefined;
  currentNewTour: string | undefined;
  currentNewTourStep: string | undefined;
}

export const initialState: HelpState = {
  currentTour: undefined,
  currentNewTour: undefined,
  currentNewTourStep: undefined,
};

export const helpReducer = generateReducer<HelpState>(initialState)
  .add<string>(Actions.START_TOUR, (s, { payload }) => {
    s.currentTour = payload;
    return s;
  })
  .add<string>(Actions.SET_TOUR, (s, { payload }) => {
    s.currentNewTour = payload;
    return s;
  })
  .add<string>(Actions.SET_TOUR_STEP, (s, { payload }) => {
    s.currentNewTourStep = payload;
    return s;
  });
