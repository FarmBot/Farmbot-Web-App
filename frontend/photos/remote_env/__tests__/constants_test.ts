import { DEFAULT_FORMATTER, namespace } from "../constants";

describe("DEFAULT_FORMATTER", () => {
  it("crashes on bad inputs", () => {
    expect(() => {
      DEFAULT_FORMATTER.parse("CAMERA_CALIBRATION_H_HI", "_XYZ-");
    }).toThrow();
  });

  it("crashes on data types other than string,num,bool", () => {
    expect(() => {
      DEFAULT_FORMATTER.parse("CAMERA_CALIBRATION_H_HI", JSON.stringify({}));
    }).toThrow();
  });

  it("parses OK inputs (number)", () => {
    const result = DEFAULT_FORMATTER.parse("CAMERA_CALIBRATION_blur", "23");
    expect(result).toEqual(23);
  });

  it("parses OK inputs (special)", () => {
    const result = DEFAULT_FORMATTER.parse("CAMERA_CALIBRATION_morph", "true");
    expect(result).toEqual(1);
  });

  it("formats number output", () => {
    const result = DEFAULT_FORMATTER.format("CAMERA_CALIBRATION_coord_scale", 12);
    expect(result).toEqual(12);
  });

  it("formats invalid special value output", () => {
    const result = DEFAULT_FORMATTER.format(
      "CAMERA_CALIBRATION_invert_hue_selection", 12);
    expect(result).toEqual("12");
  });

  it("formats valid special value output", () => {
    const result = DEFAULT_FORMATTER.format(
      "CAMERA_CALIBRATION_invert_hue_selection", 1);
    expect(result).toEqual("TRUE");
  });
});

describe("namespace()", () => {
  it("returns namespaced key", () => {
    expect(namespace("CAMERA_CALIBRATION_")("H_LO"))
      .toEqual("CAMERA_CALIBRATION_H_LO");
  });

  it("throws error", () => {
    expect(() => namespace("CAMERA_CALIBRATION_")("key"))
      .toThrow("CAMERA_CALIBRATION_key is not a valid key.");
  });
});
