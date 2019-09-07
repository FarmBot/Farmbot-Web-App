jest.mock("../../../api/crud", () => ({
  overwrite: jest.fn(),
}));

import { remove, move, splice, renderCeleryNode } from "../index";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { overwrite } from "../../../api/crud";
import {
  Wait, If, ExecuteScript, Execute, FindHome, MoveAbsolute, SendMessage,
  TakePhoto, SetServoAngle, TogglePin, Zero, Calibrate, Home, Reboot,
  CheckUpdates, FactoryReset, Sync, DumpInfo, PowerOff, ReadStatus,
  EmergencyLock, EmergencyUnlock, InstallFirstPartyFarmware
} from "farmbot";
import { mount } from "enzyme";
import { StepParams, MessageType } from "../../interfaces";
import { emptyState } from "../../../resources/reducer";

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
  const fakeProps = () => ({ step: step2, sequence, to: 0, from: 1, });

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
  const fakeProps = () => ({ step, sequence, index: 1, });

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

  const fakeProps = (): StepParams => ({
    currentSequence: fakeSequence(),
    currentStep: currentStep,
    dispatch: jest.fn(),
    index: 0,
    resources: emptyState().index,
    confirmStepDeletion: false,
  });

  const TEST_DATA = [
    {
      node: {
        kind: "_if",
        args: {
          lhs: "pin0", op: "is", rhs: 0, _then: { kind: "nothing", args: {} },
          _else: { kind: "nothing", args: {} }
        }
      } as If, expected: "Then Execute"
    },
    {
      node: {
        kind: "execute_script",
        args: { label: "farmware-to-execute" }
      } as ExecuteScript, expected: "Manual Input"
    },
    {
      node: { kind: "execute", args: { sequence_id: 0 } } as Execute,
      expected: "Sequence"
    },
    {
      node: {
        kind: "find_home", args: { speed: 100, axis: "all" }
      } as FindHome, expected: "Find x"
    },
    {
      node: {
        kind: "move_absolute",
        args: {
          location: { kind: "coordinate", args: { x: 1, y: 2, z: 3 } },
          speed: 100,
          offset: { kind: "coordinate", args: { x: 4, y: 5, z: 6 } }
        }
      } as MoveAbsolute, expected: "x-Offsety-Offsetz-OffsetSpeed (%)"
    },
    {
      node: {
        kind: "send_message",
        args: {
          message: "send this message",
          message_type: MessageType.info
        }
      } as SendMessage, expected: "Message"
    },
    { node: { kind: "take_photo", args: {} } as TakePhoto, expected: "Photo" },
    {
      node: { kind: "wait", args: { milliseconds: 100 } } as Wait,
      expected: "milliseconds"
    },
    {
      node: {
        kind: "set_servo_angle",
        args: { pin_number: 4, pin_value: 90, }
      } as SetServoAngle, expected: "Servo"
    },
    {
      node: { kind: "toggle_pin", args: { pin_number: 13 } } as TogglePin,
      expected: "Pin"
    },
    {
      node: { kind: "zero", args: { axis: "all" } } as Zero,
      expected: "Zero x"
    },
    {
      node: { kind: "calibrate", args: { axis: "all" } } as Calibrate,
      expected: "Calibrate x"
    },
    {
      node: { kind: "home", args: { axis: "all", speed: 100, } } as Home,
      expected: "Home x"
    },
    {
      node: { kind: "reboot", args: { package: "farmbot_os" } } as Reboot,
      expected: "System"
    },
    {
      node: {
        kind: "check_updates", args: { package: "farmbot_os" }
      } as CheckUpdates,
      expected: "System"
    },
    {
      node: {
        kind: "factory_reset", args: { package: "farmbot_os" }
      } as FactoryReset,
      expected: "System"
    },
    { node: { kind: "sync", args: {} } as Sync, expected: "" },
    { node: { kind: "dump_info", args: {} } as DumpInfo, expected: "" },
    { node: { kind: "power_off", args: {} } as PowerOff, expected: "" },
    { node: { kind: "read_status", args: {} } as ReadStatus, expected: "" },
    {
      node: { kind: "emergency_lock", args: {} } as EmergencyLock,
      expected: ""
    },
    {
      node: { kind: "emergency_unlock", args: {} } as EmergencyUnlock,
      expected: ""
    },
    {
      node: {
        kind: "install_first_party_farmware", args: {}
      } as InstallFirstPartyFarmware, expected: ""
    },
    // tslint:disable-next-line:no-any
    { node: { kind: "unknown", args: { unknown: 0 } } as any, expected: "unknown" },
  ];

  it("renders correct step", () => {
    TEST_DATA.map(test => {
      const p = fakeProps();
      p.currentStep = test.node;
      const step = renderCeleryNode(p);
      expect(mount(step).text()).toContain(test.expected);
    });
  });
});
