import { clamp } from "lodash";

/** Improved array that is useful for up/down situations such as the webcam
 * feed flipper UI. TODO: This can be re-used for farmware image viewer. */
export class Flipper<T> {
  private go = (n: number) =>
    (cb: (next: T | undefined, index: number) => void) => {
      this.inc(n);
      cb(this.current, this.index);
    }

  private inc = (num: number) => {
    const i = this.index;
    this.index = clamp(i + num, 0, this.list.length - 1);
    return this.index;
  }

  /** Retrieve the currently viewed item. Returns a fallback when unable to find
   * an element. */
  get current(): T { return this.list[this.index] || this.fallback; }

  constructor(public list: T[],
    public fallback: T,
    private index: number,
  ) { }

  /** Move to next item in the list (if possible) and execute
   * provided callback. */
  up = this.go(1);

  /** Move to previous item in the list (if possible) and execute
   * provided callback. */
  down = this.go(-1);

}
