import "@testing-library/jest-dom";
import "./customMatchers";

expect.extend({
  toContainHTML(received: Element | { innerHTML?: string }, expected: string) {
    const actual = received?.innerHTML ?? "";
    const pass = actual.includes(expected);

    return {
      pass,
      message: () =>
        `expected html to${pass ? " not" : ""} contain ` +
        `${this.utils.printExpected(expected)}\n` +
        `received: ${this.utils.printReceived(actual)}`,
    };
  },
});
