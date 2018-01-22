/** Useful for calculating uploads and progress bars for Promise.all */
export class Progress {
  constructor(public total: number,
    public cb: ProgressCallback,
    public completed = 0) { }

  get isDone() {
    return this.completed >= this.total;
  }

  bump = (force = false) => {
    if (force || !this.isDone) { this.cb(this); }
  }

  inc = () => { this.completed++; this.bump(); };

  finish = () => { this.completed = this.total; this.bump(true); };
}

/** If you're creating a module that publishes Progress state, you can use this
 * to prevent people from directly modifying the progress. */
export type ProgressCallback = (p: Readonly<Progress>) => void;
