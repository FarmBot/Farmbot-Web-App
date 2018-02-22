import {
  buildResourceIndex
} from "../../../__test_support__/resource_index_builder";
import {
  pinDropdowns,
  PIN_RANGE,
  PIN_HEADING,
  PinGroupName,
  peripheralsAsDropDowns,
  PERIPHERAL_HEADING,
  SENSOR_HEADING,
  sensorsAsDropDowns
} from "../pin_and_peripheral_support";
import * as _ from "lodash";
import { fakePeripheral, fakeSensor } from "../../../__test_support__/fake_state/resources";
import { DropDownItem } from "../../../ui";

describe("Pin and Peripheral support files", () => {
  it("has a list of unnamed pins", () => {
    expect(pinDropdowns.length)
      .toBe(PIN_RANGE.length + 1); // 54 pins plus the header.
    expect(pinDropdowns[0]).toBe(PIN_HEADING);
    // Grab all uniq heading IDs- we expect only 1.
    const values = _(pinDropdowns)
      .tail()
      .map((x: DropDownItem) => x.headingId)
      .uniq()
      .value();
    expect(values).toEqual([PinGroupName.pin]);
  });

  it("Makes a list of Peripheral drop downs", () => {
    const p = fakePeripheral();
    p.body.label = "The one";
    const ri = buildResourceIndex([p]);
    const result = peripheralsAsDropDowns(ri.index);
    expect(result.length).toEqual(2); // Heading + 1 peripheral
    expect(result[0]).toBe(PERIPHERAL_HEADING);
    expect(result[1].label).toEqual(p.body.label);
  });

  it("Makes a list of Sensor drop downs", () => {
    const s = fakeSensor();
    s.body.label = "The one";
    const ri = buildResourceIndex([s]);
    const result = sensorsAsDropDowns(ri.index);
    expect(result.length).toEqual(2); // Heading + 1 peripheral
    expect(result[0]).toBe(SENSOR_HEADING);
    expect(result[1].label).toEqual(s.body.label);
  });
});
