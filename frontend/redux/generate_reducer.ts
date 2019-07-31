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
  /** A function that is passed the state, action and action handler.
   * This is useful if you have custom business logic that needs to exit early
   * or trigger alternative action handlers. Example: Not triggering
   * INIT_RESOURCE when UI is set to "read-only" mode. */
  type BeforeEach = (state: State,
    action: ReduxAction<unknown>,
    handler: ActionHandler<State>) => State;

  interface GeneratedReducer extends ActionHandler<State> {
    /** Adds action handler for current reducer. */
    add: <T>(name: Actions, fn: ActionHandler<State, T>) => GeneratedReducer;
    /** Triggered before each call. Give you a chance to bail on execution if
     * business logic requires it. */
    beforeEach(filter: BeforeEach): GeneratedReducer;
    /**Triggered after all calls- useful when you have child reducers that need
     * state passed down. */
    afterEach(handler: ActionHandler<State>): GeneratedReducer;
  }

  /** Internal information used by `generateReducer` to manage a reducer.
   * This is never exposed publicly. */
  interface PrivateStuff {
    actionHandlers: ActionHandlerDict;
    afterEach: ActionHandler<State>;
    beforeEach: BeforeEach;
  }

  type ActionHandlerDict = Dictionary<ActionHandler<State>>;

  /** Used as a NO-OP when no action handler is found for an action. */
  const EMPTY_HANDLER: ActionHandler<State> =
    (state, _action) => state;

  /** The most simple BeforeFilter. Does not implement any special logic and
   * always triggers the action handler. */
  const DEFAULT_BEFORE_EACH: BeforeEach =
    (state, action, handler) => handler(state, action);

  const priv: PrivateStuff = {
    actionHandlers: {},
    afterEach: EMPTY_HANDLER,
    beforeEach: DEFAULT_BEFORE_EACH
  };

  const reducer: GeneratedReducer =
    ((state = initialState, action: ReduxAction<unknown>): State => {

      // Find the handler in the dictionary, or use the NOOP.
      const handler = (priv.actionHandlers[action.type] || EMPTY_HANDLER);

      // Defensively clone the action and state to avoid accidental mutations.
      const clonedState = defensiveClone(state);
      // Run main action handler
      const beforeState = priv.beforeEach(clonedState, action, handler);

      // Run `afterEach` (if any). Else, just return the state object as-is.
      return priv.afterEach(beforeState, action);
    }) as GeneratedReducer;

  reducer.add = <X>(name: string, fn: ActionHandler<State, X>) => {
    priv.actionHandlers[name] = fn;
    return reducer;
  };

  reducer.afterEach = (handler) => {
    priv.afterEach = handler;
    return reducer;
  };

  reducer.beforeEach = (filter: BeforeEach) => {
    priv.beforeEach = filter;
    return reducer;
  };

  return reducer;
}
