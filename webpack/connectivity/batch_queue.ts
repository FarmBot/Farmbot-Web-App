import { TaggedLog } from "../resources/tagged_resources";
import { store } from "../redux/store";
import { batchInitResources, bothUp } from "./connect_device";
import { maybeGetDevice } from "../resources/selectors";
import * as moment from "moment";
import { DeviceAccountSettings } from "../devices/interfaces";

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
  }

  work = () => {
    const dev = maybeGetDevice(store.getState().resources.index);
    const cooldown = dev && calculateCooldownTime(dev.body);
    if (cooldown) {
      console.log("Throttled...");
    } else {
      console.log("Processing " + this.queue.length + " logs");
      store.dispatch(batchInitResources(this.queue));
    }
    this.clear();
    bothUp();
  }

  push = (resource: TaggedLog) => {
    this.queue.push(resource);
  }

  clear = () => this.queue = [];
}

/** Calculates minutes the device was forced to wait due to log flooding.
 * Note that this is _total_ time and not time elapsed.
 */
function calculateCooldownTime(dev: Partial<DeviceAccountSettings>): number {
  const { throttled_at, throttled_until } = dev;

  if (throttled_at && throttled_until) {
    const start = moment(throttled_at);
    const end = moment(throttled_until);

    return start.diff(end, "minutes");
  } else {
    return 0;
  }
}

/** The only work queue needed for the whole app.
 * Mock this out in your tests. */
export const globalQueue = new BatchQueue(1500);
