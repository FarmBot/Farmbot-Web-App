import { DEFAULT_FORMATTER } from "../constants";

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
    let result = DEFAULT_FORMATTER.parse("CAMERA_CALIBRATION_blur", "23");
    expect(result).toEqual(23)
  });

  it("parses OK inputs (special)", () => {
    let result = DEFAULT_FORMATTER.parse("CAMERA_CALIBRATION_morph", "true");
    expect(result).toEqual(1);
  });

  it("formats outputs", () => {
    let result = DEFAULT_FORMATTER.format("CAMERA_CALIBRATION_coord_scale", 12);
    expect(result).toEqual(12);
  });
});
