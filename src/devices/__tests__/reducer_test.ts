import { versionOK, botReducer, initialState } from "../reducer";
import { Actions } from "../../constants";

describe("safeStringFetch", () => {
  it("Checks the correct version on update", () => {
    expect(versionOK("9.1.9-rc99", 3, 0)).toBeTruthy();
    expect(versionOK("3.0.9-rc99", 3, 0)).toBeTruthy();
    expect(versionOK("4.0.0", 3, 0)).toBeTruthy();
    expect(versionOK("4.0.0", 3, 1)).toBeTruthy();
    expect(versionOK("3.1.0", 3, 0)).toBeTruthy();
    expect(versionOK("2.0.-", 3, 0)).toBeFalsy();
    expect(versionOK("2.9.4", 3, 0)).toBeFalsy();
    expect(versionOK("1.9.6", 3, 0)).toBeFalsy();
    expect(versionOK("3.1.6", 4, 0)).toBeFalsy();
  });
});

describe("botRedcuer", () => {
  it("Handles Actions.SETTING_UPDATE_START", () => {
    let after = botReducer(initialState, {
      type: Actions.SETTING_UPDATE_START,
      payload: undefined
    });
    expect(after.isUpdating).toBe(false);
  });
});
