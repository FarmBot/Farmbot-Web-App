/** Improved array that is useful for up/down situations such as the webcam
 * feed flipper UI. */

export class Flipper<T> {
  private go = (n: number) =>
    (cb: (next: T | undefined, index: number) => void) => {
      this.inc(n);
      cb(this.current, this.index);
    }

  private inc = (num: number) => {
    const i = this.index;
    const maxIndex = this.list.length - 1;
    const newIndex = i + num;
    if (newIndex < 0) {
      this.index = maxIndex;
    } else if (newIndex > maxIndex) {
      this.index = 0;
    } else {
      this.index = newIndex;
    }
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
