import { TaggedLog } from "../resources/tagged_resources";
import { store } from "../redux/store";
import { batchInitResources, bothUp } from "./connect_device";
// import { getDeviceAccountSettings } from "../resources/selectors";

/** Performs resource initialization (Eg: a storm of incoming logs) in batches
 * at a regular interval. We only need one work queue for the whole app,
 * but singletons are bad. */
export class BatchQueue {
  private queue: TaggedLog[] = [];

  /** Create a new batch queue that will check for new messages and execute them
   * at a specified work rate (ms).*/
  constructor(workRateMS: number) {
    // We will need to store this int if we ever want to cancel queue polling:
    window.setInterval(this.maybeWork, workRateMS);
  }

  maybeWork = () => {
    const { length } = this.queue;
    length && this.work();
    this.clear();
  }

  work = () => {
    // const { body } = getDeviceAccountSettings(store.getState().resources.index);
    // if (body.throttled_until && body.throttled_at) {
    //   console.log("We're throttled...");
    // } else {
    console.log("Processing " + length);
    store.dispatch(batchInitResources(this.queue));
    // }
    bothUp();
  }

  push = (resource: TaggedLog) => {
    this.queue.push(resource);
  }

  clear = () => this.queue = [];
}

/** The only work queue needed for the whole app.
 * Mock this out in your tests. */
export const globalQueue = new BatchQueue(1500);
