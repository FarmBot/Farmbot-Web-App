const mockRun = jest.fn();

class MockFBToast {
  static everyMessage: Record<string, boolean> = {};
  run = mockRun;
}

jest.mock("../fb_toast", () => {
  return { FBToast: MockFBToast };
});

import { FBToast } from "../fb_toast";
import { CreateToastOnceProps } from "../interfaces";
import { createToastOnce, createToast } from "../toast_internal_support";

describe("toast internal support files", () => {
  const fakeProps = (): CreateToastOnceProps => ({
    message: "foo",
    title: "bar",
    color: "baz",
    idPrefix: "id-prefix",
    noTimer: false,
    noDismiss: false,
  });

  it("creates a toast and attaches to DOM", () => {
    const p = fakeProps();
    p.fallbackLogger = jest.fn();
    const container = document.createElement("DIV");
    container.className = "toast-container";
    document.body.appendChild(container);

    createToastOnce(p);

    expect(FBToast.everyMessage[p.message]).toBe(true);
    expect(p.fallbackLogger).not.toHaveBeenCalled();
    expect(mockRun).toHaveBeenCalled();

    createToastOnce(p);

    expect(p.fallbackLogger).toHaveBeenCalled();
  });

  it("uses default fallback logger", () => {
    document.body.innerHTML = "";
    console.log = jest.fn();
    const container = document.createElement("DIV");
    container.className = "toast-container";
    document.body.appendChild(container);
    const p = fakeProps();
    p.idPrefix = "";
    delete FBToast.everyMessage[p.message];
    createToastOnce(p);
    expect(console.log).not.toHaveBeenCalled();
    expect(mockRun).toHaveBeenCalled();
    createToastOnce(p);
    expect(console.log).toHaveBeenCalled();
  });

  it("crashes if you don't attach .toast-container", () => {
    const p = fakeProps();
    document.body.innerHTML = "";
    expect(() => createToast(p)).toThrow();
  });
});
