jest.mock("../util/util", () => ({
  trim: jest.fn((s: unknown) => s),
  defensiveClone: jest.fn((s: unknown) => s)
}));

jest.mock("../i18n", () => ({
  detectLanguage: jest.fn(() => Promise.resolve())
}));

jest.mock("../util/stop_ie", () => ({ stopIE: jest.fn() }));
jest.mock("i18next", () => ({ init: jest.fn() }));
jest.mock("../routes", () => ({ attachAppToDom: { mock: "Yeah" } }));

import { stopIE } from "../util/stop_ie";
import { detectLanguage } from "../i18n";
import I from "i18next";

describe("entry file", () => {
  it("Calls the expected callbacks", async () => {
    console.log = jest.fn();

    await import("../entry");

    expect(stopIE).toHaveBeenCalled();
    expect(detectLanguage).toHaveBeenCalled();
    expect(I.init).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("ABCD");
  });
});
