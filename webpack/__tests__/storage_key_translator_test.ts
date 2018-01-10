import { DONE_FLAG, maybeRunLocalstorageMigration } from "../storage_key_translator";
import { NumericSetting } from "../session_keys";
import { camelCase } from "lodash";

describe("maybeRunLocalstorageMigration", () => {
  it("translate legacyKeyNames to new_key_names", () => {

    /** This is a temporary stub.
     * Don't want to spend a bunch of time writing in depth tests for a function
     * that will have a one month shelf life. */
    localStorage.clear();
    const legacyKey = camelCase(NumericSetting.bot_origin_quadrant);
    const storedValue = "1";
    localStorage.setItem(legacyKey, storedValue);
    expect(localStorage.getItem(DONE_FLAG)).toBeUndefined();
    expect(localStorage.getItem(NumericSetting.bot_origin_quadrant))
      .toBeUndefined();

    maybeRunLocalstorageMigration();

    expect(localStorage.getItem(NumericSetting.bot_origin_quadrant))
      .toBe(storedValue);
    expect(localStorage.getItem(DONE_FLAG)).toBe(DONE_FLAG);
  });
});
