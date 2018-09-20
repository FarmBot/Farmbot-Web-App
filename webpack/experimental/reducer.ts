import { generateReducer } from "../redux/generate_reducer";
import { Actions } from "../constants";

export interface RouterState { current: string; }

export const routeReducerDefaultState: RouterState = {
  current: "/not_ready"
};

export const routeReducer = generateReducer<RouterState>(routeReducerDefaultState)
  .add<string>(Actions.ROUTE_CHANGE,
    (_, { payload }) => ({ current: payload }));
