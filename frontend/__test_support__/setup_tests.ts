import "@testing-library/jest-dom";
import "./customMatchers";

type TestCanvasGetContext = (
  this: HTMLCanvasElement,
  contextId: string,
  options?: unknown,
) => RenderingContext | null;

const canvasGetContext = HTMLCanvasElement.prototype.getContext as
  TestCanvasGetContext;
HTMLCanvasElement.prototype.getContext = function (
  this: HTMLCanvasElement,
  contextId: string,
  options?: unknown,
) {
  if (contextId == "webgl" || contextId == "webgl2") {
    return {} as WebGLRenderingContext;
  }
  return canvasGetContext.call(this, contextId, options);
} as typeof HTMLCanvasElement.prototype.getContext;

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
