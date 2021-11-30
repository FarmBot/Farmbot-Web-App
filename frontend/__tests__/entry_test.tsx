jest.mock("../util/util", () => ({
  trim: jest.fn((s: unknown) => s),
  defensiveClone: jest.fn((s: unknown) => s)
}));

jest.mock("../i18n", () => ({
  detectLanguage: jest.fn(() => Promise.resolve())
}));

jest.mock("../util/stop_ie", () => ({
  stopIE: jest.fn(),
  temporarilyStopFrames: jest.fn()
}));

jest.mock("../routes", () => ({ attachAppToDom: jest.fn() }));

import { stopIE } from "../util/stop_ie";
import { detectLanguage } from "../i18n";
import { init } from "i18next";

describe("entry file", () => {
  it("Calls the expected callbacks", async () => {
    await import("../entry");

    expect(stopIE).toHaveBeenCalled();
    expect(detectLanguage).toHaveBeenCalled();
    expect(init).toHaveBeenCalled();
  });
});
