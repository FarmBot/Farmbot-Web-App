import * as I18n from "../i18n";
import { revertToEnglish } from "../revert_to_english";

describe("revertToEnglish", () => {
  it("runs without throwing", async () => {
    jest.spyOn(I18n, "detectLanguage")
      .mockResolvedValue({ lng: "en" });

    await expect(Promise.resolve(revertToEnglish() as unknown))
      .resolves.toBeUndefined();
  });
});
