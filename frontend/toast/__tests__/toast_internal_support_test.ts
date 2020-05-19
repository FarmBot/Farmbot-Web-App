const mockRun = jest.fn();

class MockFBToast {
  static everyMessage: Record<string, boolean> = {};
  run = mockRun;
}

jest.mock("../fb_toast", () => {
  return { FBToast: MockFBToast };
});

import { FBToast } from "../fb_toast";
import { createToastOnce, createToast } from "../toast_internal_support";

describe("toast internal support files", () => {
  it("creates a toast and attaches to DOM", () => {
    const msg = "foo";
    const fallback = jest.fn();
    const container = document.createElement("DIV");
    container.className = "toast-container";
    document.body.appendChild(container);

    createToastOnce(msg, "bar", "baz", "id-prefix", false, fallback);

    expect(FBToast.everyMessage[msg]).toBe(true);
    expect(fallback).not.toHaveBeenCalled();
    expect(mockRun).toHaveBeenCalled();

    createToastOnce(msg, "bar", "baz", "id-prefix", false, fallback);

    expect(fallback).toHaveBeenCalled();
  });

  it("uses default fallback logger", () => {
    document.body.innerHTML = "";
    console.warn = jest.fn();
    const container = document.createElement("DIV");
    container.className = "toast-container";
    document.body.appendChild(container);
    const msg = "foo";
    delete FBToast.everyMessage[msg];
    createToastOnce(msg, "bar", "baz", "", false);
    expect(console.warn).not.toHaveBeenCalled();
    expect(mockRun).toHaveBeenCalled();
    createToastOnce(msg, "bar", "baz", "", false);
    expect(console.warn).toHaveBeenCalled();
  });

  it("crashes if you don't attach .toast-container", () => {
    document.body.innerHTML = "";
    expect(() => createToast("x", "y", "z", "id-prefix", false)).toThrow();
  });
});
