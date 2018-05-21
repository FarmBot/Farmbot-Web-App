import { TaggedLog } from "../resources/tagged_resources";
import { store } from "../redux/store";
import { batchInitResources, bothUp } from "./connect_device";
import * as moment from "moment";

/** Performs resource initialization (Eg: a storm of incoming logs) in batches
 * at a regular interval. We only need one work queue for the whole app,
 * but singletons are bad. */
class BatchQueue {
  private queue: TaggedLog[] = [];
  private timerId = 0;

  /** Create a new batch queue that will check for new messages and execute them
   * at a specified work rate (ms).*/
  constructor(workRateMS: number) {
    this.timerId = window.setInterval(this.work, workRateMS);
  }

  work = () => {
    const start = moment();
    const { length } = this.queue;
    length && store.dispatch(batchInitResources(this.queue));
    length && bothUp();
    this.clear();
    const end = moment();
    const ms = moment.duration(end.diff(start)).asMilliseconds();
    length && console.log(`${length} items processed in ${ms} ms`);
  }

  push = (resource: TaggedLog) => {
    this.queue.push(resource);
  }
  clear = () => this.queue = [];
  destroy = () => window.clearInterval(this.timerId);
}

/** The only work queue needed for the whole app.
 * Mock this out in your tests. */
export const globalQueue = new BatchQueue(1500);
