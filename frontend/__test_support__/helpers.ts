import { fireEvent } from "@testing-library/react";

const getContainer = (input: unknown): ParentNode | undefined => {
  if (!input) { return undefined; }
  if (input instanceof Document || input instanceof DocumentFragment) {
    return input;
  }
  if (input instanceof Element) {
    return input;
  }
  const container = (input as { container?: unknown }).container;
  if (container instanceof Element || container instanceof DocumentFragment) {
    return container;
  }
  return undefined;
};

/** Simulate a click and check button text for a button in a wrapper. */
// eslint-disable-next-line complexity
export function clickButton(
  wrapper: { container: ParentNode } | ParentNode,
  position: number,
  text: string,
  options?: { partial_match?: boolean, icon?: string }) {
  const textMatches = (actualText: string) =>
    options?.partial_match
      ? actualText.includes(text.toLowerCase())
      : actualText === text.toLowerCase();
  const container = getContainer(wrapper);
  const buttons = Array.from(container?.querySelectorAll("button") ?? []);
  if (position < 0) {
    position = buttons.length + position;
  }
  const initialButton = buttons[position];
  expect(initialButton).toBeTruthy();
  if (!initialButton) { return; }
  let button = initialButton;
  const expectedText = text.toLowerCase();
  let actualText = button?.textContent?.toLowerCase().trim() ?? "";
  if (!textMatches(actualText)) {
    const match = buttons.find(btn =>
      textMatches((btn.textContent ?? "").toLowerCase().trim()));
    if (match) {
      button = match;
      actualText = (button.textContent ?? "").toLowerCase().trim();
    }
  }
  options?.partial_match
    ? expect(actualText).toContain(expectedText)
    : expect(actualText).toEqual(expectedText);
  options?.icon && expect(button?.innerHTML ?? "").toContain(options.icon);
  fireEvent.click(button);
}

/** Like `wrapper.text()`, but only includes buttons. */
export function allButtonText(
  wrapper: { container: ParentNode } | ParentNode,
): string {
  const container = getContainer(wrapper);
  return Array.from(container?.querySelectorAll("button") ?? [])
    .map(button => button.textContent ?? "")
    .join("");
}

/** Simulate BlurableInput commit (when not using shallow). */
export function changeBlurableInput(
  wrapper: { container: ParentNode } | ParentNode,
  value: string,
  position = 0,
) {
  const container = getContainer(wrapper);
  const input = container?.querySelectorAll("input").item(position) as
    HTMLInputElement | null;
  expect(input).toBeTruthy();
  fireEvent.focus(input as Element);
  fireEvent.change(input as Element, {
    target: { value },
    currentTarget: { value },
  });
  fireEvent.blur(input as Element, {
    target: { value },
    currentTarget: { value },
  });
}

/** Simulate BlurableInput commit. */
export function changeBlurableInputRTL(
  input: HTMLElement,
  value: string,
) {
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value } });
  fireEvent.blur(input);
}

export const fetchResponse = (
  read: () => Promise<ReadableStreamReadResult<never>>,
  response?: Partial<Response>,
): Response => ({
  ok: true,
  body: {
    getReader: () => ({
      read,
      cancel: jest.fn(),
      releaseLock: jest.fn(),
      closed: Promise.resolve(undefined),
    }),
    locked: false,
    cancel: jest.fn(),
    pipeThrough: jest.fn(),
    pipeTo: jest.fn(),
    tee: jest.fn(),
  },
  headers: {
    append: jest.fn(), delete: jest.fn(),
    get: jest.fn(), has: jest.fn(), set: jest.fn(), forEach: jest.fn()
  },
  redirected: false,
  status: 200,
  statusText: "status",
  type: "default",
  url: "",
  clone: jest.fn(),
  bodyUsed: false,
  arrayBuffer: jest.fn(),
  blob: jest.fn(),
  formData: jest.fn(),
  json: jest.fn(),
  text: jest.fn(),
  ...response,
} as Response);
