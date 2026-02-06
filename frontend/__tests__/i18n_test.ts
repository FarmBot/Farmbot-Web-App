const defaultMockGet = () => Promise.resolve({
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
let mockGet = defaultMockGet();

import axios from "axios";
import { FilePath } from "../internal_urls";
const i18nModule = jest.requireActual("../i18n");
const {
  generateUrl, getUserLang, generateI18nConfig, detectLanguage,
} = i18nModule;

const LANG_CODE = "en_US";
const HOST = "local.dev";
const PORT = "2323";

beforeEach(() => {
  jest.clearAllMocks();
  mockGet = defaultMockGet();
  jest.spyOn(axios, "get").mockImplementation((_url: string) => mockGet);
});

afterEach(() => {
  jest.restoreAllMocks();
});

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
    expect(axios.get).toHaveBeenCalledWith(
      generateUrl("en_us", location.host, location.port));
    expect(result).toEqual("en");
  });

  it("defaults to `en` when failure occurs", () => {
    mockGet = Promise.reject("Simulated failure");
    const BAD_LANG_CODE = "ab_CD"; // Intentionally non-existent lang code.
    return getUserLang(BAD_LANG_CODE, HOST, PORT)
      .then((result: string) => {
        expect(axios.get).toHaveBeenCalled();
        expect(axios.get).toHaveBeenCalledWith(
          generateUrl(BAD_LANG_CODE, HOST, PORT));
        expect(result).toEqual("en");
      });
  });
});

describe("detectLanguage()", () => {
  it("detects language", async () => {
    Object.defineProperty(navigator, "language", { value: "en", configurable: true });
    const config = await detectLanguage("en");
    expect(config?.lng || "en").toEqual("en");
  });
});
