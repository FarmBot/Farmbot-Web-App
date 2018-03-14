const mockFn = jest.fn();

jest.mock("../../i18n", () => {
  return { detectLanguage: jest.fn(() => Promise.resolve(mockFn)) };
});

jest.mock("i18next", () => {
  return { init: jest.fn() };
});

import { detectLanguage } from "../../i18n";
import { onInit } from "../on_init";
import * as I18n from "i18next";

describe("password reset index", () => {
  it("loads the app", async () => {
    await import("../index");
    expect(detectLanguage).toHaveBeenCalled();
    expect(I18n.init).toHaveBeenCalled();
  });
});
