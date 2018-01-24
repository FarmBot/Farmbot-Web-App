jest.mock("axios", () => {
  return {
    default: {
      get: jest.fn((_url: string) => {
        return Promise.resolve();
      })
    }
  };
});
import { generateUrl, getUserLang, generateI18nConfig } from "../i18n";
import axios from "axios";

const LANG_CODE = "en_US";

describe("generateUrl", () => {
  it("Generates a URL from a language code", () => {
    Object.defineProperty(location, "host", {
      value: "local.dev",
      configurable: true
    });

    Object.defineProperty(location, "port", {
      value: 2323,
      configurable: true
    });

    const result = generateUrl(LANG_CODE);
    expect(result).toBe("//local.dev:2323/app-resources/languages/en.js");
  });
});

describe("getUserLang", () => {
  it("gets the user's language", (done) => {
    getUserLang()
      .then((result) => {
        expect(axios.get).toHaveBeenCalled();
        expect(axios.get).toHaveBeenCalledWith(generateUrl(LANG_CODE));
        expect(result).toEqual("en");
        done();
      })
      .catch((x) => {
        fail(x.message);
      });
  });
});

describe("generateI18nConfig", () => {
  it("generates a config with defaults", async () => {
    const result = await generateI18nConfig("en");
    expect(result.lng).toBe("en");
  });
});
