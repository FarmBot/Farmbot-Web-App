let mockGet = Promise.resolve({
  data: {
    "translated": {
      "A": "B"
    },
    "untranslated": {
      "C": "C"
    },
    "other_translations": {
      "D": "E"
    }
  }
});
jest.mock("axios", () => ({ get: jest.fn((_url: string) => mockGet) }));

import {
  generateUrl, getUserLang, generateI18nConfig, detectLanguage,
} from "../i18n";
import axios from "axios";
import { FilePath } from "../internal_urls";

const LANG_CODE = "en_US";
const HOST = "local.dev";
const PORT = "2323";

describe("generateUrl", () => {
  it("Generates a URL from a language code", () => {
    const result = generateUrl(LANG_CODE, HOST, PORT);
    expect(result).toBe("//local.dev:2323" + FilePath.language("en"));
  });
});

describe("generateI18nConfig", () => {
  it("generates a config with defaults", async () => {
    const result = await generateI18nConfig("en");
    expect(result.lng).toBe("en");
    result.resources
      ? expect(result.resources.en.translation).toEqual({ A: "B", C: "C", D: "E" })
      : expect(result.resources).toBeTruthy();
  });
});

describe("getUserLang", () => {
  it("gets the user's language", async () => {
    const result = await getUserLang(LANG_CODE, HOST, PORT);
    expect(axios.get).toHaveBeenCalled();
    expect(axios.get).toHaveBeenCalledWith(generateUrl(LANG_CODE, HOST, PORT));
    expect(result).toEqual("en");
  });

  it("defaults to `en`", async () => {
    const result = await getUserLang();
    expect(axios.get).toHaveBeenCalled();
    expect(axios.get).toHaveBeenCalledWith(generateUrl("en_us", "", ""));
    expect(result).toEqual("en");
  });

  it("defaults to `en` when failure occurs", async () => {
    mockGet = Promise.reject("Simulated failure");
    const BAD_LANG_CODE = "ab_CD"; // Intentionally non-existent lang code.
    return getUserLang(BAD_LANG_CODE, HOST, PORT)
      .then((result) => {
        expect(axios.get).toHaveBeenCalled();
        expect(axios.get).toHaveBeenCalledWith(
          generateUrl(BAD_LANG_CODE, HOST, PORT));
        expect(result).toEqual("en");
      });
  });
});

describe("detectLanguage()", () => {
  it("detects language", () => {
    Object.defineProperty(navigator, "language", { value: "en" });
    detectLanguage().catch(() => { });
    expect(axios.get).toHaveBeenCalledWith(generateUrl("en", "", ""));
  });
});
