import { ReduxAction } from "./interfaces";
import { defensiveClone } from "../util";
import { Actions } from "../constants";
import { Dictionary } from "farmbot";

/** A function that responds to a particular action from within a
 * generated reducer. */
export interface ActionHandler<State, Payload = unknown> {
  (state: State, action: ReduxAction<Payload>): State;
}

export function generateReducer<State>(initialState: State) {
  interface GeneratedReducer extends ActionHandler<State> {
    /** Adds action handler for current reducer. */
    add: <T>(name: Actions, fn: ActionHandler<State, T>) => GeneratedReducer;
    afterEach(handler: ActionHandler<State>): GeneratedReducer;
    beforeFilter(): GeneratedReducer;
  }
  interface PrivateStuff {
    actionHandlers: ActionHandlerDict;
    afterEach: ActionHandler<State>;
  }
  type ActionHandlerDict = Dictionary<ActionHandler<State>>;
  const NOOP: ActionHandler<State> = (s) => s;

  const priv: PrivateStuff =
    ({ actionHandlers: {}, afterEach: NOOP });

  const reducer: GeneratedReducer =
    ((state = initialState, action: ReduxAction<unknown>): State => {

      // Find the handler in the dictionary, or use the NOOP.
      const handler = (priv.actionHandlers[action.type] || NOOP);

      // Defensively clone the action and state to avoid accidental mutations.
      const clonedState = defensiveClone(state);
      const clonedAction = defensiveClone(action);

      // Run main action handler
      const state1 = handler(clonedState, clonedAction);

      // Run `afterEach` (if any). Else, just return the state object as-is.
      return priv.afterEach(state1, action);
    }) as GeneratedReducer;

  reducer.add = <X>(name: string, fn: ActionHandler<State, X>) => {
    priv.actionHandlers[name] = fn;
    return reducer;
  };

  reducer.afterEach = (handler) => {
    priv.afterEach = handler;
    return reducer;
  };

  return reducer;
}
