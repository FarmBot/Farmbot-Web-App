const mockFn = jest.fn();
jest.mock("../../i18n", () => ({
  detectLanguage: jest.fn(() => Promise.resolve(mockFn)),
}));

import { detectLanguage } from "../../i18n";
import I from "i18next";

describe("password reset index", () => {
  it("loads the app", async () => {
    await import("../index");
    expect(detectLanguage).toHaveBeenCalled();
    expect(I.init).toHaveBeenCalled();
  });
});
