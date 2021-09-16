import {
  buildResourceIndex,
} from "../../../../__test_support__/resource_index_builder";
import { displayLhs, DisplayLhsProps } from "../display_lhs";
import {
  fakePeripheral, fakeSensor,
} from "../../../../__test_support__/fake_state/resources";

describe("displayLhs()", () => {
  const fakeProps = (): DisplayLhsProps => ({
    currentStep: {
      kind: "_if",
      args: {
        lhs: {
          kind: "named_pin",
          args: { pin_type: "Peripheral", pin_id: 1 },
        },
        op: "is",
        rhs: 0,
        _then: { kind: "nothing", args: {} },
        _else: { kind: "nothing", args: {} },
      }
    },
    resources: buildResourceIndex([]).index,
    lhsOptions: [
      { value: "Peripheral.uuid", label: "label", headingId: "headingId" },
      { value: "Sensor.uuid", label: "label", headingId: "headingId" },
    ],
  });

  it("finds peripherals to display", () => {
    const p = fakeProps();
    const peripheral = fakePeripheral();
    peripheral.body.id = 1;
    peripheral.uuid = "Peripheral.uuid";
    p.resources = buildResourceIndex([peripheral]).index;
    expect(displayLhs(p)).toEqual(p.lhsOptions[0]);
  });

  it("finds sensors to display", () => {
    const p = fakeProps();
    p.currentStep.args.lhs = {
      kind: "named_pin",
      args: { pin_type: "Sensor", pin_id: 1 },
    };
    const sensor = fakeSensor();
    sensor.body.id = 1;
    sensor.uuid = "Sensor.uuid";
    p.resources = buildResourceIndex([sensor]).index;
    expect(displayLhs(p)).toEqual(p.lhsOptions[1]);
  });
});
