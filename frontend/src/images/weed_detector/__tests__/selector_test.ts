import { translateSpecialValue } from "../selectors";
import { NULL_CHOICE } from "../../../ui/index";
import { SPECIAL_VALUES } from "../remote_env/constants";

describe("translateSpecialValue()", () => {
  it("converts SPECIAL_VALUES to DropDownItems", () => {
    let result = translateSpecialValue(SPECIAL_VALUES.X);
    expect(result.label).toEqual("X");
    expect(result.value).toEqual(SPECIAL_VALUES.X);
  });

  it("converts all others to NULL_CHOICE", () => {
    let result = translateSpecialValue(999);
    expect(result).toEqual(NULL_CHOICE);
  });
});

describe("getDropdownSelection", () => {
  it("selects SPECIAL_VALUES", () => {

  });
});
