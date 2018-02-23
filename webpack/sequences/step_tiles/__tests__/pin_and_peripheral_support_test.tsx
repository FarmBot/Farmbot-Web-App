import {
  buildResourceIndex
} from "../../../__test_support__/resource_index_builder";
import {
  dropDown2CeleryArg,
  findByPinNumber,
  isPinType,
  namedPin2DropDown,
  PERIPHERAL_HEADING,
  peripheralsAsDropDowns,
  PIN_HEADING,
  PIN_RANGE,
  pinDropdowns,
  PinGroupName,
  SENSOR_HEADING,
  sensorsAsDropDowns,
  setArgsDotPinNumber,
} from "../pin_and_peripheral_support";
import * as _ from "lodash";
import {
  fakePeripheral,
  fakeSensor,
  fakeSequence
} from "../../../__test_support__/fake_state/resources";
import { DropDownItem } from "../../../ui";
import { NamedPin, AllowedPinTypes } from "farmbot";
import { TaggedSensor, TaggedSequence } from "../../../resources/tagged_resources";
import { StepParams } from "../../interfaces";

describe("Pin and Peripheral support files", () => {
  const newIndex = () => {
    const peripheral = fakePeripheral();
    const sequence = fakeSequence();
    sequence.body.body = [
      {
        kind: "read_pin",
        args: {
          pin_mode: 0,
          label: "example",
          pin_number: {
            kind: "named_pin",
            args: {
              pin_type: "Peripheral",
              pin_id: peripheral.body.id || NaN
            }
          }
        }
      }
    ];
    return buildResourceIndex([sequence, peripheral, fakeSensor()]).index;
  };

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

  it("does'nt add peripheral/sensor headers when none available", () => {
    const s = fakeSensor();
    s.body.label = "The one";
    const ri = buildResourceIndex([]);
    const result = sensorsAsDropDowns(ri.index);
    expect(result).not.toContain(SENSOR_HEADING);
    expect(result).not.toContain(PERIPHERAL_HEADING);
  });

  it("Validates correctness of `pin_type` at runtime", () => {
    expect(isPinType("foo")).toBe(false);
    expect(isPinType("Peripheral")).toBe(true);
  });

  describe("findByPinNumber", () => {
    it("bails when it can't find pin by kind and ID", () => {
      const ri = buildResourceIndex([]).index;
      const pin_type: AllowedPinTypes = "Peripheral";
      const pin_id = 6;
      const namedPin: NamedPin = {
        kind: "named_pin",
        args: { pin_id, pin_type }
      };
      const boom = () => findByPinNumber(ri, namedPin);
      expect(boom).toThrowError("UUID or ID not found");
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
          ri.references[key] = { kind: "Intentionally wrong" } as any;
        });
      const boom = () => findByPinNumber(ri, np);
      expect(boom).toThrowError("Not a Peripheral or Sensor");
    });

    it("Finds peripherals kind and ID", () => {
      const p = fakePeripheral();
      const ri = buildResourceIndex([p]).index;
      const pin_type: AllowedPinTypes = "Peripheral";
      const pin_id = p.body.id || 0;
      const np: NamedPin = { kind: "named_pin", args: { pin_id, pin_type } };
      const result = findByPinNumber(ri, np);
      expect(result.kind).toEqual("Peripheral");
    });
  });

  describe("namedPin2DropDown", () => {
    it("converts peripherals to DropDownItems", () => {
      const p = fakePeripheral();
      const ri = buildResourceIndex([p]).index;
      debugger;
      const pin_type: AllowedPinTypes = "Peripheral";
      const pin_id = p.body.id || 0;
      const np: NamedPin = { kind: "named_pin", args: { pin_id, pin_type } };
      const result = namedPin2DropDown(ri, np);
      const expected: DropDownItem = {
        label: p.body.label,
        value: p.body.id || NaN,
        headingId: PinGroupName.peripheral
      };
      expect(result).toEqual(expected);
    });

    it("Rejects typos", () => {
      const ri = buildResourceIndex([]).index;
      const pin_type = "no" as AllowedPinTypes;
      const pin_id = 0;
      const np: NamedPin = { kind: "named_pin", args: { pin_id, pin_type } };
      const boom = () => namedPin2DropDown(ri, np);
      expect(boom).toThrowError("Bad pin_type: \"no\"");
    });
  });

  describe("dropDown2CeleryArg", () => {
    it("converts numbers to the correct type", () => {
      const ri = buildResourceIndex([]).index;
      const ddi = { label: "Pin x", value: 12 };
      expect(dropDown2CeleryArg(ri, ddi)).toEqual(12);
    });

    it("converts numbers to the correct type", () => {
      const ri = buildResourceIndex([fakeSensor()]).index;
      const s = ri.references[ri.byKind.Sensor[0]] as TaggedSensor;
      const ddi = { label: "sensor", value: s.uuid };
      const pin_type: AllowedPinTypes = "Sensor";
      const pin_id = s.body.id || NaN;
      const np: NamedPin = { kind: "named_pin", args: { pin_id, pin_type } };
      const result = dropDown2CeleryArg(ri, ddi);
      expect(result).toEqual(np);
    });

    it("bails on bad UUIDS", () => {
      const ri = buildResourceIndex([]).index;
      const ddi = { label: "sensor", value: "x.y.z" };
      const boom = () => dropDown2CeleryArg(ri, ddi);
      expect(boom).toThrowError("Bad uuid in celery arg: x.y.z");
    });
  });

  describe("setArgsDotPinNumber", () => {
    it("Sets step.args.pin_number", () => {
      const resources = newIndex();
      const dispatch = jest.fn();
      const currentSequence =
        resources.references[resources.byKind.Sequence[0]] as TaggedSequence;
      const index = 0;
      const currentStep = (currentSequence.body.body || [])[index];
      const stepParams: StepParams = {
        resources,
        dispatch,
        currentSequence,
        currentStep,
        index
      };
      const callback = setArgsDotPinNumber(stepParams);
      const ddi: DropDownItem = { label: "hmm", value: 0 };
      const action = { type: "OVERWRITE_RESOURCE" };
      callback(ddi);
      expect(stepParams.dispatch)
        .toHaveBeenCalledWith(expect.objectContaining(action));
    });
  });
});
