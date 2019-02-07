import { stopIE } from "../stop_ie";

describe("stopIE()", () => {
  beforeEach(() => {
    window.location.assign = jest.fn();
    window.alert = jest.fn();
    window.hasOwnProperty = () => true;
    Array.prototype.hasOwnProperty = () => true;
    Object.defineProperty(Object, "entries", {
      value: true, configurable: true
    });
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
