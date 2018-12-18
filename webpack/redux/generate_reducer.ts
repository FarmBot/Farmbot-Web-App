import { ReduxAction } from "./interfaces";
import { defensiveClone } from "../util";
import { Actions } from "../constants";
import { Dictionary } from "farmbot";

/** A function that responds to a particular action from within a
 * generated reducer. */
interface ActionHandler<State, Payl = unknown> {
  (state: State, action: ReduxAction<Payl>): State;
}

export function generateReducer<State, U = unknown>(initialState: State,
  /** For passing state down to children. */
  afterEach?: (s: State, a: ReduxAction<U>) => State) {

  type ActionHandlerDict = Dictionary<ActionHandler<State>>;

  interface GeneratedReducer extends ActionHandler<State> {
    /** Adds action handler for current reducer. */
    add: <T>(name: Actions, fn: ActionHandler<State, T>) => GeneratedReducer;
    // Calms the type checker.
  }

  const actionHandlers: ActionHandlerDict = {};

  const NOOP: ActionHandler<State> = (s) => s;

  const reducer: GeneratedReducer =
    // tslint:disable-next-line:no-any
    ((state = initialState, action: ReduxAction<any>): State => {

      // Find the handler in the dictionary, or use the NOOP.
      const handler = (actionHandlers[action.type] || NOOP);

      // Defensively clone the action and state to avoid accidental mutations.
      const clonedState = defensiveClone(state);
      const clonedAction = defensiveClone(action);

      // Run the reducer.
      let result: State = handler(clonedState, clonedAction);

      // Give the "afterEach" reducer a chance to run.
      result = (afterEach || NOOP)(defensiveClone(result), action);

      return result;
    }) as GeneratedReducer;

  reducer.add = <X>(name: string, fn: ActionHandler<State, X>) => {
    actionHandlers[name] = fn;
    return reducer;
  };

  return reducer;
}
