import * as i18n from "../i18n";
import { revertToEnglish } from "../revert_to_english";

let detectLanguageSpy: jest.SpyInstance;

beforeEach(() => {
  detectLanguageSpy = jest.spyOn(i18n, "detectLanguage")
    .mockImplementation(() => Promise.resolve({ lng: "de" }) as never);
});

afterEach(() => {
  detectLanguageSpy.mockRestore();
});

describe("revertToEnglish", () => {
  it("calls the appropriate handler with the appropriate config", () => {
    jest.clearAllMocks();
    revertToEnglish();
    expect(i18n.detectLanguage).toHaveBeenCalledWith("en");
    // expect(init).toHaveBeenCalled(); // WHY DOES THIS NOT WORK?
  });
});
