enum Comparison { LOW = -1, EQ = 0, HIGH = 1 }
/** Emulates the "spaceship operator" seen in languages like Ruby, PHP, etc..
 * -1 => "too low", 0 => "identical", 1 => "too high" */
export const threeWayComparison = (l: number, r: number): Comparison => {
  if (l == r) {
    return Comparison.EQ;
  }

  return (l < r) ? Comparison.LOW : Comparison.HIGH;
};
/** Moves an array item from one position in an array to another. Note that this
 * is a pure function so a new array will be returned, instead of altering the
 * array argument.
 * SOURCE:
 *   https://github.com/granteagon/move */
export function move<T>(array: T[], fromIndex: number, toIndex: number) {

  const item = array[fromIndex];
  const length = array.length;
  const diff = fromIndex - toIndex;
  switch (threeWayComparison(diff, 0)) {
    case Comparison.LOW:
      return [
        ...array.slice(0, fromIndex),
        ...array.slice(fromIndex + 1, toIndex + 1),
        item,
        ...array.slice(toIndex + 1, length)
      ];
    case Comparison.HIGH:
      return [
        ...array.slice(0, toIndex),
        item,
        ...array.slice(toIndex, fromIndex),
        ...array.slice(fromIndex + 1, length)
      ];
    default:
      return array;
  }
}
