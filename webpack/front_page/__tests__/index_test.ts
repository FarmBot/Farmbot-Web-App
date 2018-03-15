jest.mock("../../i18n", () => {
  return { detectLanguage: jest.fn(() => Promise.resolve()) };
});

jest.mock("../../util/stop_ie", () => {
  return { stopIE: jest.fn() };
});

import { detectLanguage } from "../../i18n";
import { stopIE } from "../../util/stop_ie";

describe("index", () => {
  it("Attaches to the DOM", async () => {
    await import("../index");
    expect(detectLanguage).toHaveBeenCalled();
    expect(stopIE).toHaveBeenCalled();
  });
});
