jest.mock("../i18n", () => {
  return { detectLanguage: jest.fn(() => Promise.resolve({ lng: "de" })) };
});

import { detectLanguage } from "../i18n";
import { revertToEnglish } from "../revert_to_english";
afterAll(() => {
  jest.unmock("../i18n");
});
describe("revertToEnglish", () => {
  it("calls the appropriate handler with the appropriate config", () => {
    jest.clearAllMocks();
    revertToEnglish();
    expect(detectLanguage).toHaveBeenCalledWith("en");
    // expect(init).toHaveBeenCalled(); // WHY DOES THIS NOT WORK?
  });
});
