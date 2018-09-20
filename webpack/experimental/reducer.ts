import { generateReducer } from "../redux/generate_reducer";
import { Actions } from "../constants";

export interface RouterState { $: string; }

export const routeReducerDefaultState: RouterState = {
  $: "/not_ready"
};

export const routeChange =
  (payload: string) => ({ type: Actions.ROUTE_CHANGE, payload });

export const routeReducer = generateReducer<RouterState>(routeReducerDefaultState)
  .add<string>(Actions.ROUTE_CHANGE,
    (_, { payload }) => ({ $: payload }));
