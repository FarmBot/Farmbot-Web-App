const mockEditStep = jest.fn();
jest.mock("../../../../api/crud", () => ({
  editStep: mockEditStep
}));

import {
  buildResourceIndex,
} from "../../../../__test_support__/resource_index_builder";
import * as PinSupport from "../index";
import {
  fakeFbosConfig,
  fakePeripheral, fakeSensor,
} from "../../../../__test_support__/fake_state/resources";
import { DropDownItem } from "../../../../ui";
import {
  NamedPin, AllowedPinTypes, TaggedSensor, Nothing, WritePin, ReadPin,
} from "farmbot";
import { chain } from "lodash";
import {
  fakeStepParams,
} from "../../../../__test_support__/fake_sequence_step_data";

describe("pinDropdowns()", () => {
  it("has a list of unnamed pins", () => {
    expect(PinSupport.pinDropdowns(n => n).length)
      .toBe(PinSupport.PIN_RANGE.length + 1); // pins plus the header.
    expect(PinSupport.pinDropdowns(n => n)[0]).toEqual(PinSupport.PIN_HEADING());
    // Grab all uniq heading IDs- we expect only 1.
    const values = chain(PinSupport.pinDropdowns(n => n))
      .tail()
      .map((x: DropDownItem) => x.headingId)
      .uniq()
      .value();
    expect(values).toEqual([PinSupport.PinGroupName.Pin]);
  });
});

describe("peripheralsAsDropDowns()", () => {
  it("makes a list of Peripheral drop downs", () => {
    const p = fakePeripheral();
    p.body.label = "The one";
    const ri = buildResourceIndex([p]);
    const result = PinSupport.peripheralsAsDropDowns(ri.index);
    expect(result.length).toEqual(2); // Heading + 1 peripheral
    expect(result[0]).toEqual(PinSupport.PERIPHERAL_HEADING());
    expect(result[1]).toEqual({
      label: p.body.label,
      headingId: PinSupport.PinGroupName.Peripheral,
      value: expect.stringContaining("Peripheral.")
    });
  });
});

describe("sensorsAsDropDowns()", () => {
  it("makes a list of Sensor drop downs", () => {
    const s = fakeSensor();
    s.body.label = "The one";
    const ri = buildResourceIndex([s]);
    const result = PinSupport.sensorsAsDropDowns(ri.index);
    expect(result.length).toEqual(2); // Heading + 1 sensor
    expect(result[0]).toEqual(PinSupport.SENSOR_HEADING());
    expect(result[1]).toEqual({
      label: s.body.label,
      headingId: PinSupport.PinGroupName.Sensor,
      value: expect.stringContaining("Sensor.")
    });
  });
});

describe("sensorsAsDropDowns() & peripheralsAsDropDowns()", () => {
  it("doesn't add peripheral/sensor headers when none available", () => {
    const ri = buildResourceIndex([]);
    const sResult = PinSupport.sensorsAsDropDowns(ri.index);
    const pResult = PinSupport.peripheralsAsDropDowns(ri.index);
    expect(sResult).not.toContain(PinSupport.SENSOR_HEADING());
    expect(pResult).not.toContain(PinSupport.PERIPHERAL_HEADING());
  });
});

describe("isPinType()", () => {
  it("Validates correctness of `pin_type` at runtime", () => {
    expect(PinSupport.isPinType("foo")).toBe(false);
    expect(PinSupport.isPinType("Peripheral")).toBe(true);
  });
});

describe("pinsAsDropdowns()", () => {
  it("write_pin: displays peripherals", () => {
    const s = fakeSensor();
    const p = fakePeripheral();
    s.body.label = "not displayed";
    p.body.label = "displayed peripheral";
    const ri = buildResourceIndex([s, p]);
    const result = PinSupport.pinsAsDropdowns("write_pin")(ri.index, true);
    expect(JSON.stringify(result)).toContain("displayed peripheral");
    expect(JSON.stringify(result)).not.toContain("not displayed");
  });

  it("write_pin: displays pins", () => {
    const ri = buildResourceIndex([]);
    const result = PinSupport.pinsAsDropdowns("write_pin")(ri.index, true);
    expect(JSON.stringify(result)).toContain("Pin 13");
  });

  it("write_pin: displays box LEDs", () => {
    const ri = buildResourceIndex([]);
    const result = PinSupport.pinsAsDropdowns("write_pin")(ri.index, true);
    expect(JSON.stringify(result)).toContain("Box LED");
  });

  it("write_pin: doesn't display box LEDs", () => {
    const config = fakeFbosConfig();
    config.body.firmware_hardware = "express_k10";
    const ri = buildResourceIndex([config]);
    const result = PinSupport.pinsAsDropdowns("write_pin")(ri.index, true);
    expect(JSON.stringify(result)).not.toContain("Box LED");
  });

  it("read_pin: displays peripherals and sensors", () => {
    const s = fakeSensor();
    const p = fakePeripheral();
    s.body.label = "displayed sensor";
    p.body.label = "displayed peripheral";
    const ri = buildResourceIndex([s, p]);
    const result = PinSupport.pinsAsDropdowns("read_pin")(ri.index, true);
    expect(JSON.stringify(result)).toContain("displayed sensor");
    expect(JSON.stringify(result)).toContain("displayed peripheral");
  });

  it("read_pin: displays pins", () => {
    const ri = buildResourceIndex([]);
    const result = PinSupport.pinsAsDropdowns("read_pin")(ri.index, true);
    expect(JSON.stringify(result)).toContain("Pin 13");
  });

  it("toggle_pin: displays peripherals and sensors", () => {
    const p = fakePeripheral();
    p.body.label = "displayed peripheral";
    const ri = buildResourceIndex([p]);
    const result = PinSupport.pinsAsDropdowns("toggle_pin")(ri.index, true);
    expect(JSON.stringify(result)).toContain("displayed peripheral");
  });

  it("toggle_pin: displays pins", () => {
    const ri = buildResourceIndex([]);
    const result = PinSupport.pinsAsDropdowns("toggle_pin")(ri.index, true);
    expect(JSON.stringify(result)).toContain("Pin 13");
  });
});

describe("findByPinNumber()", () => {
  it("bails when it can't find pin by kind and ID", () => {
    const ri = buildResourceIndex([]).index;
    const pin_type: AllowedPinTypes = "Peripheral";
    const pin_id = 6;
    const namedPin: NamedPin = {
      kind: "named_pin",
      args: { pin_id, pin_type }
    };
    const boom = () => PinSupport.findByPinNumber(ri, namedPin);
    expect(boom).toThrow("UUID or ID not found");
  });

  it("bails when it is not a `Peripheral` or `Sensor`", () => {
    const p = fakePeripheral();
    const ri = buildResourceIndex([p]).index;
    const pin_type: AllowedPinTypes = "Peripheral";
    const pin_id = p.body.id || 0;
    const np: NamedPin = { kind: "named_pin", args: { pin_id, pin_type } };
    Object
      .keys(ri.references)
      .map(key => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ri.references[key] = { kind: "Intentionally wrong" } as any;
      });
    const boom = () => PinSupport.findByPinNumber(ri, np);
    expect(boom).toThrow("Not a Peripheral or Sensor");
  });

  it("finds peripherals kind and ID", () => {
    const p = fakePeripheral();
    const ri = buildResourceIndex([p]).index;
    const pin_type: AllowedPinTypes = "Peripheral";
    const pin_id = p.body.id || 0;
    const np: NamedPin = { kind: "named_pin", args: { pin_id, pin_type } };
    const result = PinSupport.findByPinNumber(ri, np);
    expect(result.kind).toEqual("Peripheral");
  });
});

describe("namedPin2DropDown()", () => {
  it("converts peripherals to DropDownItems", () => {
    const p = fakePeripheral();
    const ri = buildResourceIndex([p]).index;
    const uuid = Object.keys(ri.all)[0];
    const pin_type: AllowedPinTypes = "Peripheral";
    const pin_id = p.body.id || 0;
    const np: NamedPin = { kind: "named_pin", args: { pin_id, pin_type } };
    const result = PinSupport.namedPin2DropDown(ri, np);
    const expected: DropDownItem = {
      label: p.body.label,
      value: uuid,
      headingId: PinSupport.PinGroupName.Peripheral
    };
    expect(result).toEqual(expected);
  });

  it.each<[PinSupport.BoxLed]>(Object.values(PinSupport.BoxLed).map(x => [x]),
  )("converts %s named pin to DropDownItem", (boxLed) => {
    const ri = buildResourceIndex([]).index;
    const namedPin: NamedPin = {
      kind: "named_pin",
      args: { pin_type: boxLed, pin_id: -1 }
    };
    const result = PinSupport.namedPin2DropDown(ri, namedPin);
    const expected: DropDownItem = {
      label: expect.stringContaining("LED"),
      value: boxLed,
      headingId: PinSupport.PinGroupName.BoxLed
    };
    expect(result).toEqual(expected);
  });

  it("converts nothing to DropDownItems", () => {
    const ri = buildResourceIndex([]).index;
    const n: Nothing = { kind: "nothing", args: {} };
    const result = PinSupport.namedPin2DropDown(ri, n);
    expect(result).toEqual(undefined);
  });

  it("rejects typos", () => {
    const ri = buildResourceIndex([]).index;
    const pin_type = "no" as AllowedPinTypes;
    const pin_id = 0;
    const np: NamedPin = { kind: "named_pin", args: { pin_id, pin_type } };
    const boom = () => PinSupport.namedPin2DropDown(ri, np);
    expect(boom).toThrow("Bad pin_type: \"no\"");
  });
});

describe("dropDown2CeleryArg()", () => {
  it("converts numbers to the correct type", () => {
    const ri = buildResourceIndex([]).index;
    const ddi = { label: "Pin x", value: 12 };
    expect(PinSupport.dropDown2CeleryArg(ri, ddi)).toEqual(12);
  });

  it("converts sensors to the correct type", () => {
    const ri = buildResourceIndex([fakeSensor()]).index;
    const s = ri.references[Object.keys(ri.byKind.Sensor)[0]] as TaggedSensor;
    const ddi = { label: "sensor", value: s.uuid };
    const pin_type: AllowedPinTypes = "Sensor";
    const pin_id = s.body.id || NaN;
    const np: NamedPin = { kind: "named_pin", args: { pin_id, pin_type } };
    const result = PinSupport.dropDown2CeleryArg(ri, ddi);
    expect(result).toEqual(np);
  });

  it("bails on bad UUIDS", () => {
    const ri = buildResourceIndex([]).index;
    const ddi = { label: "sensor", value: "x.y.z" };
    const boom = () => PinSupport.dropDown2CeleryArg(ri, ddi);
    expect(boom).toThrow("Bad uuid in celery arg: x.y.z");
  });

  it("converts box LED selection to named pin", () => {
    const ri = buildResourceIndex([]).index;
    const ddi = { label: "Box LED 3", value: PinSupport.BoxLed.BoxLed3 };
    const namedPin: NamedPin = {
      kind: "named_pin",
      args: { pin_type: PinSupport.BoxLed.BoxLed3, pin_id: -1 }
    };
    expect(PinSupport.dropDown2CeleryArg(ri, ddi)).toEqual(namedPin);
  });
});

describe("setArgsDotPinNumber()", () => {
  it("sets pin_number to a pin number", () => {
    const step: ReadPin = {
      kind: "read_pin",
      args: { pin_mode: 1, label: "example", pin_number: 1 }
    };
    const p = fakeStepParams(step);
    PinSupport.setArgsDotPinNumber(p)({ label: "", value: 0 });
    expect(mockEditStep).toHaveBeenCalled();
    mockEditStep.mock.calls[0][0].executor(step);
    expect(step.args.pin_number).toEqual(0);
    expect(step.args.pin_mode).toEqual(1);
  });

  it("sets pin_number to a named pin", () => {
    const step: WritePin = {
      kind: "write_pin",
      args: { pin_mode: 1, pin_value: 1, pin_number: 1 }
    };
    const p = fakeStepParams(step);
    const peripheral = fakePeripheral();
    peripheral.body.id = 1;
    p.resources = buildResourceIndex([peripheral]).index;
    PinSupport.setArgsDotPinNumber(p)({ label: "", value: peripheral.uuid });
    expect(mockEditStep).toHaveBeenCalled();
    mockEditStep.mock.calls[0][0].executor(step);
    expect(step.args.pin_number).toEqual({
      kind: "named_pin",
      args: { pin_type: "Peripheral", pin_id: 1 }
    });
    expect(step.args.pin_mode).toEqual(1);
  });

  it("sets pin_number to a BoxLed named pin", () => {
    const step: WritePin = {
      kind: "write_pin",
      args: { pin_mode: 1, pin_value: 1, pin_number: 1 }
    };
    const p = fakeStepParams(step);
    PinSupport.setArgsDotPinNumber(p)({ label: "", value: "BoxLed3" });
    expect(mockEditStep).toHaveBeenCalled();
    mockEditStep.mock.calls[0][0].executor(step);
    expect(step.args.pin_number).toEqual({
      kind: "named_pin",
      args: { pin_type: "BoxLed3", pin_id: -1 }
    });
    expect(step.args.pin_mode).toEqual(0);
  });
});

describe("isBoxLed()", () => {
  it("is box LED", () => {
    const readPinStep: ReadPin = {
      kind: "read_pin",
      args: { pin_mode: 1, label: "", pin_number: 1 }
    };
    expect(PinSupport.isBoxLed(readPinStep)).toEqual(false);
    const writePinStep: WritePin = {
      kind: "write_pin",
      args: { pin_mode: 1, pin_value: 1, pin_number: 1 }
    };
    expect(PinSupport.isBoxLed(writePinStep)).toEqual(false);
    const namedPin: NamedPin = {
      kind: "named_pin",
      args: { pin_type: "Sensor", pin_id: 0 }
    };
    writePinStep.args.pin_number = namedPin;
    expect(PinSupport.isBoxLed(writePinStep)).toEqual(false);
    writePinStep.args.pin_number.args.pin_type = "BoxLed3";
    expect(PinSupport.isBoxLed(writePinStep)).toEqual(true);
    writePinStep.args.pin_number.args.pin_type = "BoxLed4";
    expect(PinSupport.isBoxLed(writePinStep)).toEqual(true);
  });
});

describe("celery2DropDown()", () => {
  it("returns pin number item", () => {
    const ri = buildResourceIndex([]);
    const result = PinSupport.celery2DropDown(0, ri.index);
    expect(result).toEqual({ headingId: "Pin", label: "Pin 0", value: 0 });
  });

  it("returns named pin item", () => {
    const s = fakeSensor();
    s.body.id = 1;
    const ri = buildResourceIndex([s]);
    const uuid = Object.keys(ri.index.all)[0];
    const result = PinSupport.celery2DropDown({
      kind: "named_pin",
      args: { pin_type: "Sensor", pin_id: 1 }
    }, ri.index);
    expect(result).toEqual({
      headingId: "Sensor", label: "Fake Pin", value: uuid
    });
  });
});
