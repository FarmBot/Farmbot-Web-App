jest.mock("axios", () => {
  return {
    default: {
      put: jest.fn(() => {
        return Promise.resolve(undefined);
      })
    }
  };
});
import { DONE_FLAG, maybeRunLocalstorageMigration } from "../storage_key_translator";
import { NumericSetting } from "../session_keys";
import { camelCase } from "lodash";
import { API } from "../api/api";
import axios from "axios";

describe("maybeRunLocalstorageMigration", () => {
  it("translate legacyKeyNames to new_key_names", async (done) => {

    /** This is a temporary stub.
     * Don't want to spend a bunch of time writing in depth tests for a function
     * that will have a one month shelf life. */
    localStorage.clear();
    expect(localStorage.getItem(DONE_FLAG)).toBe(undefined);
    const legacyKey = camelCase(NumericSetting.bot_origin_quadrant);
    const storedValue = "1";
    localStorage.setItem(legacyKey, storedValue);
    API.setBaseUrl("http://localhost:4444");
    const p = maybeRunLocalstorageMigration();
    if (!p) { throw new Error("no"); }
    p && await p;
    expect(axios.put).toHaveBeenCalled();
    const expectedPayload = {
      [NumericSetting.bot_origin_quadrant]: JSON.parse(storedValue)
    };
    const url = "http://localhost:4444/api/web_app_config/";
    expect(axios.put).toHaveBeenCalledWith(url, expectedPayload);
    expect(localStorage.getItem(DONE_FLAG)).toEqual(DONE_FLAG);
    done();
  });
});
