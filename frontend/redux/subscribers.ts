import { Everything } from "../interfaces";
import { Store } from "./interfaces";
import { EnvName } from "./interfaces";
import { all } from "../resources/selectors";
import { getWebAppConfig } from "../resources/getters";
import { TaggedResource, TaggedWebAppConfig } from "farmbot";

export function stopThem() { return "You have unsaved work."; }
export function dontStopThem() { }

/** Determine when to notify users about unsaved changes (stop auto-discard). */
const shouldStop =
  (allResources: TaggedResource[], config: TaggedWebAppConfig | undefined) => {
    const loggedIn = !!localStorage.getItem("session");
    const discardUnsaved = config?.body.discard_unsaved;
    const sequenceResources = allResources.filter(r => r.kind === "Sequence");
    const discardUnsavedSequences = config?.body.discard_unsaved_sequences;

    /**
     * For the unsaved notification to show, a user must:
     *   be logged in,
     *   have at least some unsaved resources,
     *   not have chosen to discard all unsaved changes,
     * and either:
     *   have an unsaved non-sequence resource,
     *   or
     *   not have chosen to discard unsaved sequence changes.
     */
    return loggedIn && areSomeDirty(allResources) && !discardUnsaved &&
      (!areSomeDirty(sequenceResources) || !discardUnsavedSequences);
  };

/** Are any of the provided resources `dirty` (unsaved)? */
const areSomeDirty = (resources: TaggedResource[]) => {
  const dirty = resources.filter(r => !!r.specialStatus);
  const total = dirty.length;
  return total !== 0;
};

/** Subscribe to the store. Stop the user from exiting if any part of the
 * state tree contains `dirty` resources that can't be discarded. */
export function unsavedCheck(state: Everything) {
  const { index } = state.resources;
  const resources = all(index);
  const conf = getWebAppConfig(index);

  window.onbeforeunload = shouldStop(resources, conf) ? stopThem : dontStopThem;
}

export interface Subscription { fn: (state: Everything) => void; env: EnvName; }

/** To make it easier to manage all things watching the state tree,
 * we keep subscriber functions in this array. */
export const subscriptions: Subscription[] = [{ env: "*", fn: unsavedCheck }];

export function registerSubscribers(store: Store) {
  const ENV_LIST = [process.env.NODE_ENV, "*"];
  subscriptions.forEach(function (s) {
    ENV_LIST.includes &&
      ENV_LIST.includes(s.env) &&
      store.subscribe(() => s.fn?.(store.getState()));
  });
}
