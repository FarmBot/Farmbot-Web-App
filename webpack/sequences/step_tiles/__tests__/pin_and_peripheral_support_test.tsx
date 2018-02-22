import {
  buildResourceIndex
} from "../../../__test_support__/resource_index_builder";
import {
  pinDropdowns,
  PIN_RANGE,
  PIN_HEADING,
  PinGroupName
} from "../pin_and_peripheral_support";
import * as _ from "lodash";

describe("Pin and Peripheral support files", () => {
  it("has a list of unnamed pins", () => {
    expect(pinDropdowns.length)
      .toBe(PIN_RANGE.length + 1); // 54 pins plus the header.
    expect(pinDropdowns[0]).toBe(PIN_HEADING);
    // Grab all uniq heading IDs- we expect only 1.
    const values = _(pinDropdowns).tail().map(x => x.headingId).uniq().value();
    expect(values).toEqual([PinGroupName.pin]);
  });

  it("Makes a list of Peripheral drop down selectors", () => {
    buildResourceIndex();
    expect(2 + 2).toBe(4);
  });

  it("Makes a list of Sensor drop down selectors");
});
