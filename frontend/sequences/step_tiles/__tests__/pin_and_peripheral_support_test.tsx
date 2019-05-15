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
  pinsAsDropDownsReadPin,
  pinsAsDropDownsWritePin,
  celery2DropDown,
  BoxLed,
} from "../pin_and_peripheral_support";
import {
  fakePeripheral,
  fakeSensor,
  fakeSequence
} from "../../../__test_support__/fake_state/resources";
import { DropDownItem } from "../../../ui";
import {
  NamedPin, AllowedPinTypes, TaggedSensor, TaggedSequence, Nothing
} from "farmbot";
import { StepParams } from "../../interfaces";
import { Actions } from "../../../constants";
import { chain } from "lodash";

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
    expect(pinDropdowns(n => n).length)
      .toBe(PIN_RANGE.length + 1); // 54 pins plus the header.
    expect(pinDropdowns(n => n)[0]).toBe(PIN_HEADING);
    // Grab all uniq heading IDs- we expect only 1.
    const values = chain(pinDropdowns(n => n))
      .tail()
      .map((x: DropDownItem) => x.headingId)
      .uniq()
      .value();
    expect(values).toEqual([PinGroupName.Pin]);
  });

  it("Makes a list of Peripheral drop downs", () => {
    const p = fakePeripheral();
    p.body.label = "The one";
    const ri = buildResourceIndex([p]);
    const result = peripheralsAsDropDowns(ri.index);
    expect(result.length).toEqual(2); // Heading + 1 peripheral
    expect(result[0]).toBe(PERIPHERAL_HEADING);
    expect(result[1]).toEqual({
      label: p.body.label,
      headingId: PinGroupName.Peripheral,
      value: expect.stringContaining("Peripheral.")
    });
  });

  it("Makes a list of Sensor drop downs", () => {
    const s = fakeSensor();
    s.body.label = "The one";
    const ri = buildResourceIndex([s]);
    const result = sensorsAsDropDowns(ri.index);
    expect(result.length).toEqual(2); // Heading + 1 sensor
    expect(result[0]).toBe(SENSOR_HEADING);
    expect(result[1]).toEqual({
      label: s.body.label,
      headingId: PinGroupName.Sensor,
      value: expect.stringContaining("Sensor.")
    });
  });

  it("doesn't add peripheral/sensor headers when none available", () => {
    const ri = buildResourceIndex([]);
    const sResult = sensorsAsDropDowns(ri.index);
    const pResult = peripheralsAsDropDowns(ri.index);
    expect(sResult).not.toContain(SENSOR_HEADING);
    expect(pResult).not.toContain(PERIPHERAL_HEADING);
  });

  it("Validates correctness of `pin_type` at runtime", () => {
    expect(isPinType("foo")).toBe(false);
    expect(isPinType("Peripheral")).toBe(true);
  });

  describe("pinsAsDropDownsWritePin()", () => {
    it("displays peripherals", () => {
      const s = fakeSensor();
      const p = fakePeripheral();
      s.body.label = "not displayed";
      p.body.label = "displayed peripheral";
      const ri = buildResourceIndex([s, p]);
      const result = pinsAsDropDownsWritePin(ri.index, true);
      expect(JSON.stringify(result)).toContain("displayed peripheral");
      expect(JSON.stringify(result)).not.toContain("not displayed");
    });

    it("displays pins", () => {
      const ri = buildResourceIndex([]);
      const result = pinsAsDropDownsWritePin(ri.index, true);
      expect(JSON.stringify(result)).toContain("Pin 13");
    });
  });

  describe("pinsAsDropDownsReadPin()", () => {
    it("displays peripherals and sensors", () => {
      const s = fakeSensor();
      const p = fakePeripheral();
      s.body.label = "displayed sensor";
      p.body.label = "displayed peripheral";
      const ri = buildResourceIndex([s, p]);
      const result = pinsAsDropDownsReadPin(ri.index, true);
      expect(JSON.stringify(result)).toContain("displayed sensor");
      expect(JSON.stringify(result)).toContain("displayed peripheral");
    });

    it("displays pins", () => {
      const ri = buildResourceIndex([]);
      const result = pinsAsDropDownsReadPin(ri.index, true);
      expect(JSON.stringify(result)).toContain("Pin 13");
    });
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
          // tslint:disable-next-line:no-any
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
      const uuid = Object.keys(ri.all)[0];
      const pin_type: AllowedPinTypes = "Peripheral";
      const pin_id = p.body.id || 0;
      const np: NamedPin = { kind: "named_pin", args: { pin_id, pin_type } };
      const result = namedPin2DropDown(ri, np);
      const expected: DropDownItem = {
        label: p.body.label,
        value: uuid,
        headingId: PinGroupName.Peripheral
      };
      expect(result).toEqual(expected);
    });

    Object.values(BoxLed).map(boxLed => {
      it(`converts ${boxLed} named pin to DropDownItem`, () => {
        const ri = buildResourceIndex([]).index;
        const namedPin: NamedPin = {
          kind: "named_pin",
          args: { pin_type: boxLed, pin_id: -1 }
        };
        const result = namedPin2DropDown(ri, namedPin);
        const expected: DropDownItem = {
          label: expect.stringContaining("LED"),
          value: boxLed,
          headingId: PinGroupName.BoxLed
        };
        expect(result).toEqual(expected);
      });
    });

    it("converts nothing to DropDownItems", () => {
      const ri = buildResourceIndex([]).index;
      const n: Nothing = { kind: "nothing", args: {} };
      const result = namedPin2DropDown(ri, n);
      const expected: DropDownItem = {
        label: "Select a pin", value: "", isNull: true
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

    it("converts sensors to the correct type", () => {
      const ri = buildResourceIndex([fakeSensor()]).index;
      const s = ri.references[Object.keys(ri.byKind.Sensor)[0]] as TaggedSensor;
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

    it("converts box LED selection to named pin", () => {
      const ri = buildResourceIndex([]).index;
      const ddi = { label: "Box LED 3", value: BoxLed.BoxLed3 };
      const namedPin: NamedPin = {
        kind: "named_pin",
        args: { pin_type: BoxLed.BoxLed3, pin_id: -1 }
      };
      expect(dropDown2CeleryArg(ri, ddi)).toEqual(namedPin);
    });
  });

  describe("setArgsDotPinNumber", () => {
    it("Sets step.args.pin_number", () => {
      const resources = newIndex();
      const dispatch = jest.fn();
      const currentSequence =
        resources.references[Object.keys(resources.byKind.Sequence)[0]] as TaggedSequence;
      const index = 0;
      const currentStep = (currentSequence.body.body || [])[index];
      const stepParams: StepParams = {
        resources,
        dispatch,
        currentSequence,
        currentStep,
        index,
        confirmStepDeletion: false,
      };
      const callback = setArgsDotPinNumber(stepParams);
      const ddi: DropDownItem = { label: "hmm", value: 0 };
      const action = { type: Actions.OVERWRITE_RESOURCE };
      callback(ddi);
      expect(stepParams.dispatch)
        .toHaveBeenCalledWith(expect.objectContaining(action));
    });
  });

  describe("celery2DropDown()", () => {
    it("returns pin number item", () => {
      const ri = buildResourceIndex([]);
      const result = celery2DropDown(0, ri.index);
      expect(result).toEqual({ headingId: "Pin", label: "Pin 0", value: 0 });
    });

    it("returns named pin item", () => {
      const s = fakeSensor();
      s.body.id = 1;
      const ri = buildResourceIndex([s]);
      const uuid = Object.keys(ri.index.all)[0];
      const result = celery2DropDown({
        kind: "named_pin",
        args: { pin_type: "Sensor", pin_id: 1 }
      }, ri.index);
      expect(result).toEqual({
        headingId: "Sensor", label: "Fake Pin", value: uuid
      });
    });
  });
});
