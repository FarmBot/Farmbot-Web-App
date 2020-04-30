jest.mock("../../../api/crud", () => ({
  overwrite: jest.fn(),
}));

import { remove, move, splice, renderCeleryNode } from "../index";
import {
  fakeSequence, fakePlant,
} from "../../../__test_support__/fake_state/resources";
import { overwrite } from "../../../api/crud";
import { SequenceBodyItem, Wait } from "farmbot";
import { mount } from "enzyme";
import { StepParams, MessageType } from "../../interfaces";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";

describe("remove()", () => {
  const fakeProps = () => ({
    index: 0,
    dispatch: jest.fn(),
    sequence: fakeSequence(),
    confirmStepDeletion: false,
  });

  it("deletes step without confirmation", () => {
    const p = fakeProps();
    remove(p);
    expect(p.dispatch).toHaveBeenCalled();
  });

  it("deletes step with confirmation", () => {
    const p = fakeProps();
    p.confirmStepDeletion = true;
    window.confirm = jest.fn();
    remove(p);
    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining("delete this step?"));
    expect(p.dispatch).not.toHaveBeenCalled();
    window.confirm = jest.fn(() => true);
    remove(p);
    expect(p.dispatch).toHaveBeenCalled();
  });
});

describe("move()", () => {
  const sequence = fakeSequence();
  const step1: Wait = { kind: "wait", args: { milliseconds: 100 } };
  const step2: Wait = { kind: "wait", args: { milliseconds: 200 } };
  sequence.body.body = [step1, step2];
  const fakeProps = () => ({ step: step2, sequence, to: 0, from: 1 });

  it("moves step backward", () => {
    const p = fakeProps();
    p.from = 1;
    p.to = 0;
    move(p);
    expect(overwrite).toHaveBeenCalledWith(expect.any(Object),
      expect.objectContaining({ body: [step2, step1] }));
  });

  it("moves step forward", () => {
    const p = fakeProps();
    p.sequence.body.body = [step2, step1];
    p.from = 0;
    p.to = 2;
    move(p);
    expect(overwrite).toHaveBeenCalledWith(expect.any(Object),
      expect.objectContaining({ body: [step1, step2] }));
  });
});

describe("splice()", () => {
  const sequence = fakeSequence();
  const step: Wait = { kind: "wait", args: { milliseconds: 100 } };
  const fakeProps = () => ({ step, sequence, index: 1 });

  it("adds step", () => {
    const p = fakeProps();
    splice(p);
    expect(overwrite)
      .toHaveBeenCalledWith(expect.any(Object),
        expect.objectContaining({ body: expect.any(Array) }));
  });
});

describe("renderCeleryNode()", () => {
  const currentStep: Wait = { kind: "wait", args: { milliseconds: 100 } };

  const plant = fakePlant();
  plant.body.id = 23;

  const fakeProps = (): StepParams => ({
    currentSequence: fakeSequence(),
    currentStep: currentStep,
    dispatch: jest.fn(),
    index: 0,
    resources: buildResourceIndex([plant]).index,
    confirmStepDeletion: false,
  });

  interface TestData {
    node: SequenceBodyItem;
    expected: string;
  }

  const TEST_DATA: TestData[] = [
    {
      node: {
        kind: "_if",
        args: {
          lhs: "pin0",
          op: "is",
          rhs: 0,
          _then: { kind: "nothing", args: {} },
          _else: { kind: "nothing", args: {} }
        }
      },
      expected: "Then Execute"
    },
    {
      node: { kind: "execute_script", args: { label: "farmware-to-execute" } },
      expected: "Manual Input"
    },
    {
      node: { kind: "execute", args: { sequence_id: 0 } },
      expected: "Select a sequence"
    },
    {
      node: {
        kind: "move_absolute",
        args: {
          location: { kind: "coordinate", args: { x: 1, y: 2, z: 3 } },
          speed: 100,
          offset: { kind: "coordinate", args: { x: 4, y: 5, z: 6 } }
        }
      },
      expected: "x-Offsety-Offsetz-OffsetSpeed (%)"
    },
    {
      node: {
        kind: "send_message",
        args: {
          message: "send this message",
          message_type: MessageType.info
        }
      },
      expected: "Message"
    },
    {
      node: { kind: "take_photo", args: {} },
      expected: "Photo"
    },
    {
      node: { kind: "wait", args: { milliseconds: 100 } },
      expected: "milliseconds"
    },
    {
      node: {
        kind: "update_resource",
        args: {
          resource: {
            kind: "resource",
            args: { resource_id: 23, resource_type: "Plant" }
          }
        },
        body: [
          { kind: "pair", args: { label: "plant_stage", value: "planted" } },
        ]
      },
      expected: "markstrawberry plant 1 (100, 200, 0)fieldplant stageasplanted"
    },
    {
      node: {
        kind: "resource_update",
        args: {
          resource_id: 23,
          resource_type: "Plant",
          label: "plant_stage",
          value: "planted",
        }
      },
      expected: "mark plant 23 plant_stage as plantedthis step has been deprecated."
    },
    {
      node: { kind: "set_servo_angle", args: { pin_number: 4, pin_value: 90 } },
      expected: "Servo"
    },
    {
      node: { kind: "toggle_pin", args: { pin_number: 13 } },
      expected: "Pin"
    },
    {
      node: { kind: "find_home", args: { speed: 100, axis: "all" } },
      expected: "Find x"
    },
    {
      node: { kind: "zero", args: { axis: "all" } },
      expected: "Zero x"
    },
    {
      node: { kind: "calibrate", args: { axis: "all" } },
      expected: "Calibrate x"
    },
    {
      node: { kind: "home", args: { axis: "all", speed: 100 } },
      expected: "Home x"
    },
    {
      node: { kind: "emergency_lock", args: {} },
      expected: "Unlocking a device requires user intervention"
    },
    {
      node: { kind: "reboot", args: { package: "farmbot_os" } },
      expected: "power cycle farmbot's onboard computer."
    },
    {
      node: { kind: "check_updates", args: { package: "farmbot_os" } },
      expected: "System"
    },
    {
      node: { kind: "factory_reset", args: { package: "farmbot_os" } },
      expected: "System"
    },
    {
      node: { kind: "sync", args: {} },
      expected: ""
    },
    {
      node: { kind: "power_off", args: {} },
      expected: ""
    },
    {
      node: { kind: "read_status", args: {} },
      expected: ""
    },
    {
      node: { kind: "emergency_unlock", args: {} },
      expected: ""
    },
    {
      node: { kind: "install_first_party_farmware", args: {} },
      expected: ""
    },
    {
      // tslint:disable-next-line: no-any
      node: { kind: "unknown", args: { unknown: 0 } } as any,
      expected: "unknown"
    },
  ];

  it("renders correct step", () => {
    TEST_DATA.map(test => {
      const p = fakeProps();
      p.currentStep = test.node;
      const step = renderCeleryNode(p);
      const verbiage = mount(step).text().toLowerCase();
      expect(verbiage).toContain(test.expected.toLowerCase());
    });
  });
});
