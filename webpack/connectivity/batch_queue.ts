/** Performs operations in batches at a regular  interval.
 * Useful for rendering intensive tasks such as handling massive amounts of
 * incoming logs.
 * We only need one work queue for the whole app, but singletons are bad. */
class BatchQueue {
  private queue: Function[] = [];
  private timerId = 0;

  /** Create a new batch queue that will check for new messages and execute them
   * at a specified work rate (ms).*/
  constructor(workRateMS = 600) {
    this.timerId = window.setInterval(this.work, workRateMS);
  }

  work = () => {
    this.queue.map(fn => fn());
    // NOTE: If we hit perf issues still, we can set a BATCH_SIZE where we never
    //       exec more than X jobs per pass. YAGNI?
    this.clear();
  }

  push = (job: Function) => this.queue.push(job);
  clear = () => this.queue = [];
  destroy = () => window.clearInterval(this.timerId);
}

/** The only work queue needed for the whole app.
 * Mock this out in your tests. */
export const globalQueue = new BatchQueue(250);
