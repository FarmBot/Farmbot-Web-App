import * as defaultValues from "../../default_values";
import { getModifiedClassName } from "../default_values";

describe("getModifiedClassName()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns class name", () => {
    const modifiedSpy = jest.spyOn(defaultValues, "getModifiedClassNameSpecifyDefault")
      .mockImplementation((value, defaultValue) => value === defaultValue ? "" : "modified");

    expect(getModifiedClassName("encoder_enabled_x", 1, "arduino")).toEqual("");
    expect(getModifiedClassName("encoder_enabled_x", 0, "arduino"))
      .toEqual("modified");
    expect(getModifiedClassName("encoder_enabled_x", 0, "arduino", () => 1))
      .toEqual("");

    expect(modifiedSpy).toHaveBeenCalled();
  });
});
