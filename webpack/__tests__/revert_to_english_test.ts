// jest.mock("i18next", () => {
//   return { init: jest.fn() };
// });

jest.mock("../i18n", () => {
  return { detectLanguage: jest.fn(() => Promise.resolve({ lng: "de" })) };
});

import { init } from "i18next";
import { detectLanguage } from "../i18n";
import { revertToEnglish } from "../revert_to_english";
describe("revertToEnglish", () => {
  it("calls the appropriate handler with the appropriate config", () => {
    pending();
    revertToEnglish();
    expect(detectLanguage).toHaveBeenCalledWith("en");
    // expect(init).toHaveBeenCalled();
    // // With(expect.objectContaining({ lng: "en" }), expect.anything());
  });
});
