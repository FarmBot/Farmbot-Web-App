import * as React from "react";
import { render } from "enzyme";
import { PeripheralList } from "../peripheral_list";
import { TaggedPeripheral } from "../../../resources/tagged_resources";
import { Pins } from "farmbot/dist";

describe("<PeripheralList/>", function () {
  const peripherals: TaggedPeripheral[] = [
    {
      uuid: "peripherals.2.2",
      kind: "peripherals",
      body: {
        id: 2,
        pin: 13,
        label: "GPIO 13 - LED"
      }
    },
    {
      uuid: "peripherals.1.1",
      kind: "peripherals",
      body: {
        id: 1,
        pin: 2,
        label: "GPIO 2"
      }
    },
  ]

  const pins: Pins = {
    13: {
      mode: 0,
      value: 1
    },
    2: {
      mode: 0,
      value: 1
    }
  }
  it("renders a list of peripherals, in sorted order", function () {
    pending("Stopping here for now. Still needs finishing.");
    let node = <PeripheralList dispatch={() => { }}
      peripherals={peripherals}
      pins={pins} />
    let labels = render(node).find("label");
    let first = labels.first();
    expect(first.text()).toBeTruthy();
    expect(first.text()).toContain("GPIO 2")
    let last = labels.last();
    expect(last.text()).toBeTruthy();
    expect(last.text()).toContain("GPIO 2")
  });
});
