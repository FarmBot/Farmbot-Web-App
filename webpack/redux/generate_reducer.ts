import { ReduxAction } from "./interfaces";
import { defensiveClone } from "../util";
import { Actions } from "../constants";
import { Dictionary } from "farmbot";

/** A function that responds to a particular action from within a
 * generated reducer. */
interface ActionHandler<State, Payl = any> {
  (state: State, action: ReduxAction<Payl>): State;
}

// tslint:disable-next-line:no-any
export function generateReducer<State, U = any>(initialState: State,
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
    ((state = initialState, action: ReduxAction<any>): State => {

      // Find the handler in the dictionary, or use the NOOP.
      const handler = (actionHandlers[action.type] || NOOP);

      // Defensivly clone the action and state to avoid accidental mutations.
      const clonedState = defensiveClone(state);
      const clonedAction = defensiveClone(action);

      // Run the reducer.
      let result: State = handler(clonedState, clonedAction);

      // Give the "afterEach" reducer a chance to run.
      result = (afterEach || NOOP)(defensiveClone(result), action);

      // TODO: Do I really need to clone this?
      return result;
    }) as GeneratedReducer;

  reducer.add = <X>(name: string, fn: ActionHandler<State, X>) => {
    actionHandlers[name] = fn;
    return reducer;
  };

  return reducer;
}
