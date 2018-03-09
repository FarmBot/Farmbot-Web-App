jest.mock("axios", () => {
  return {
    default: {
      get: jest.fn((_url: string) => {
        return Promise.reject("Simulated failure");
      })
    }
  };
});

import { generateUrl, getUserLang } from "../i18n";
import axios from "axios";

const LANG_CODE = "ab_CD"; // Intentionally non-existent lang code.

describe("getUserLang", () => {
  it("defaults to `en` when failure occurs", (done) => {
    getUserLang(LANG_CODE)
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
