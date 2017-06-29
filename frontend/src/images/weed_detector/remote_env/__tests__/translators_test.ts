import { formatEnvKey, parseEnvKey } from "../translators";
import { SPECIAL_VALUES, getSpecialValue } from "../constants";
import { WD_ENV, WDENVKey } from "../interfaces";
import { getDropdownSelection } from "../../selectors";
import { prepopulateEnv } from "../selectors";

describe("getSpecialValue()", () => {
  it("translates values", () => {
    expect(getSpecialValue(JSON.stringify("TRUE")))
      .toEqual(SPECIAL_VALUES.TRUE);

    expect(getSpecialValue(JSON.stringify("FALSE")))
      .toEqual(SPECIAL_VALUES.FALSE);

    expect(getSpecialValue(JSON.stringify("Bottom_LEft")))
      .toEqual(SPECIAL_VALUES.BOTTOM_LEFT);

    expect(getSpecialValue(JSON.stringify("ToP_LeFT")))
      .toEqual(SPECIAL_VALUES.TOP_LEFT);
  });

  it("crashes on malformed inputs", () => {
    expect(() => {
      getSpecialValue("FOo_bar!!")
    }).toThrow();
  });
});

describe("formatEnvKey()", () => {

  it("translates the things", () => {
    [
      {
        k: "CAMERA_CALIBRATION_invert_hue_selection",
        v: SPECIAL_VALUES.TRUE,
        r: "TRUE"
      },
      {
        k: "CAMERA_CALIBRATION_invert_hue_selection",
        v: SPECIAL_VALUES.FALSE,
        r: "FALSE"
      },
      {
        k: "CAMERA_CALIBRATION_calibration_along_axis",
        v: SPECIAL_VALUES.X,
        r: "X"
      },
      {
        k: "CAMERA_CALIBRATION_calibration_along_axis",
        v: SPECIAL_VALUES.Y,
        r: "Y"
      },
      {
        k: "CAMERA_CALIBRATION_image_bot_origin_location",
        v: SPECIAL_VALUES.TOP_LEFT,
        r: "TOP_LEFT"
      }
    ].map(t => {
      expect(formatEnvKey(t.k as WDENVKey, t.v)).toEqual(t.r);
    });
  });
});

describe("parseEnvKey()", () => {
  it("makes stuff a number again", () => {
    let val = "\"Y\"";
    let r = parseEnvKey("CAMERA_CALIBRATION_calibration_along_axis", val);
    expect(r).toEqual(SPECIAL_VALUES.Y);
  });
});

describe("getDropdownSelection()", () => {
  it("unpacks special string values", () => {
    let key: WDENVKey = "CAMERA_CALIBRATION_calibration_along_axis";
    let stubs = { [key]: "\"Y\"" };
    let fakeEnv = prepopulateEnv(stubs);
    expect(fakeEnv[key]).toEqual(SPECIAL_VALUES.Y);
    let finder = getDropdownSelection(fakeEnv);
    let result = finder(key);
    expect(result.value).toEqual(SPECIAL_VALUES.Y);
  });
});
