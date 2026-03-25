import { stopIE } from "../stop_ie";

describe("stopIE()", () => {
  const originalWindowHasOwnProperty = window.hasOwnProperty;
  const originalArrayHasOwnProperty = Array.prototype.hasOwnProperty;
  const originalObjectEntriesDescriptor =
    Object.getOwnPropertyDescriptor(Object, "entries");

  beforeEach(() => {
    window.hasOwnProperty = () => true;
    Array.prototype.hasOwnProperty = () => true;
    Object.defineProperty(Object, "entries", {
      value: true, configurable: true
    });
  });

  afterEach(() => {
    window.hasOwnProperty = originalWindowHasOwnProperty;
    Array.prototype.hasOwnProperty = originalArrayHasOwnProperty;
    if (originalObjectEntriesDescriptor) {
      Object.defineProperty(Object, "entries", originalObjectEntriesDescriptor);
    } else {
      delete (Object as unknown as Record<string, unknown>).entries;
    }
  });

  const expectToHaveBeenStopped = () => {
    expect(window.alert).toHaveBeenCalledWith(
      "This app only works with modern browsers.");
    expect(window.location.assign).toHaveBeenCalledWith(
      "https://www.google.com/chrome/");
  };

  it("doesn't block when requirements are met", () => {
    stopIE();
    expect(window.alert).not.toHaveBeenCalled();
    expect(window.location.assign).not.toHaveBeenCalled();
  });

  it("blocks when requirements not met", () => {
    Object.defineProperty(Object, "entries", { value: undefined });
    stopIE();
    expectToHaveBeenStopped();
  });

  it("blocks when requirements not met: window", () => {
    window.hasOwnProperty = () => false;
    stopIE();
    expectToHaveBeenStopped();
  });

  it("blocks when requirements not met: array", () => {
    Array.prototype.hasOwnProperty = () => false;
    stopIE();
    expectToHaveBeenStopped();
  });

  it("blocks when requirements not met: error", () => {
    Array.prototype.hasOwnProperty = () => { throw new Error(); };
    stopIE();
    expectToHaveBeenStopped();
  });
});
