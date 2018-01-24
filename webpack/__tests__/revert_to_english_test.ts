jest.mock("../i18n", () => {
  return { detectLanguage: jest.fn(() => Promise.resolve({ lng: "de" })) };
});

import { detectLanguage } from "../i18n";
import { revertToEnglish } from "../revert_to_english";
describe("revertToEnglish", () => {
  it("calls the appropriate handler with the appropriate config", () => {
    jest.resetAllMocks();
    revertToEnglish();
    expect(detectLanguage).toHaveBeenCalledWith("en");
    // expect(init).toHaveBeenCalled(); // WHY DOES THIS NOT WORK?
  });
});
