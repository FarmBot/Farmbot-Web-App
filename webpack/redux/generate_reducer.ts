import { ReduxAction } from "./interfaces";
import { defensiveClone } from "../util";
import { Actions } from "../constants";

export function generateReducer<State>(initialState: State,
  /** For passing state down to children. */
  afterEach?: (s: State, a: ReduxAction<any>) => State) {
  /** A function that responds to a particular action from within a
   * generated reducer. */
  interface ActionHandler {
    (state: State, action: ReduxAction<any>): State;
  }

  interface GenericActionHandler<T> {
    (state: State, action: ReduxAction<T>): State;
  }

  interface ActionHandlerDict {
    [actionHandler: string]: ActionHandler;
  }

  interface GeneratedReducer extends ActionHandler {
    /** Adds action handler for current reducer. */
    add: <T>(name: Actions, fn: GenericActionHandler<T>) => GeneratedReducer;
    // Calms the type checker.
  }

  const actionHandlers: ActionHandlerDict = {};

  const reducer: GeneratedReducer = function <T>(state = initialState,
    action: ReduxAction<T>): State {
    const NOOP: ActionHandler = (s, a) => s;
    const handler = (actionHandlers[action.type] || NOOP);
    const clonedState = defensiveClone(state);
    const clonedAction = defensiveClone(action);
    let result: State = handler(clonedState, clonedAction);
    result = (afterEach || NOOP)(defensiveClone(result), action);
    return defensiveClone(result);
  } as GeneratedReducer;

  reducer.add = function addHandler<T>(name: string,
    fn: GenericActionHandler<T>) {
    actionHandlers[name] = fn;
    return reducer;
  };

  return reducer;
}
