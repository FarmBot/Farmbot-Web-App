jest.mock("../util/stop_ie", () => {
  return {
    stopIE: jest.fn()
  };
});

jest.mock("../util/util", () => {
  return {
    shortRevision: jest.fn(),
    trim: jest.fn((s: unknown) => s),
    defensiveClone: jest.fn((s: unknown) => s)
  };
});

jest.mock("../i18n", () => {
  return {
    detectLanguage: jest.fn(() => Promise.resolve())
  };
});

jest.mock("i18next", () => {
  return {
    init: jest.fn()
  };
});

jest.mock("../routes", () => {
  return {
    attachAppToDom: { mock: "Yeah" }
  };
});

import { stopIE } from "../util/stop_ie";
import { shortRevision } from "../util/util";
import { detectLanguage } from "../i18n";
import I from "i18next";

describe("entry file", () => {
  it("Calls the expected callbacks", async () => {
    await import("../entry");

    expect(stopIE).toHaveBeenCalled();
    expect(shortRevision).toHaveBeenCalled();
    expect(detectLanguage).toHaveBeenCalled();
    expect(I.init).toHaveBeenCalled();
  });
});
