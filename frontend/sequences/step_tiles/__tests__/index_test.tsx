jest.mock("../../../api/crud", () => ({
  overwrite: jest.fn(),
}));

let mockExceeded = false;
jest.mock("../../actions", () => ({
  sequenceLengthExceeded: () => mockExceeded,
}));

import {
  remove, move, splice, renderCeleryNode, stringifySequenceData,
  updateStep, updateStepTitle,
} from "../index";
import {
  fakeSequence, fakePlant,
} from "../../../__test_support__/fake_state/resources";
import { overwrite } from "../../../api/crud";
import { SequenceBodyItem, Wait } from "farmbot";
import { mount } from "enzyme";
import {
  StepParams, MessageType, RemoveParams, MoveParams, SpliceParams,
  StepInputProps, StepTitleBarProps,
} from "../../interfaces";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { inputEvent } from "../../../__test_support__/fake_html_events";
import { cloneDeep } from "lodash";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";

describe("move()", () => {
  const sequence = fakeSequence();
  const step1: Wait = { kind: "wait", args: { milliseconds: 100 } };
  const step2: Wait = { kind: "wait", args: { milliseconds: 200 } };
  sequence.body.body = [step1, step2];
  const fakeProps = (): MoveParams => ({
    step: step2,
    sequence,
    to: 0,
    from: 1,
  });

  it("moves step backward", () => {
    const p = fakeProps();
    p.from = 1;
    p.to = 0;
    move(p);
    expect(overwrite).toHaveBeenCalledWith(p.sequence,
      expect.objectContaining({ body: [cloneDeep(step2), cloneDeep(step1)] }));
  });

  it("moves step forward", () => {
    const p = fakeProps();
    p.sequence.body.body = [step2, step1];
    p.from = 0;
    p.to = 2;
    move(p);
    expect(overwrite).toHaveBeenCalledWith(p.sequence,
      expect.objectContaining({ body: [step1, step2] }));
  });

  it("handles missing body", () => {
    const p = fakeProps();
    p.sequence.body.body = undefined;
    p.from = 1;
    p.to = 0;
    move(p);
    expect(overwrite).toHaveBeenCalledWith(p.sequence,
      expect.objectContaining({ body: [] }));
  });
});

describe("splice()", () => {
  const sequence = fakeSequence();
  const step: Wait = { kind: "wait", args: { milliseconds: 100 } };
  const fakeProps = (): SpliceParams => ({
    step,
    sequence,
    index: 1,
  });

  it("adds step", () => {
    const p = fakeProps();
    splice(p);
    expect(overwrite).toHaveBeenCalledWith(p.sequence,
      expect.objectContaining({
        body: [{
          kind: "wait", args: { milliseconds: 100 },
          uuid: expect.stringContaining("-"),
        }]
      }));
  });

  it("handles missing body", () => {
    const p = fakeProps();
    p.sequence.body.body = undefined;
    splice(p);
    expect(overwrite).toHaveBeenCalledWith(p.sequence,
      expect.objectContaining({
        body: [{
          kind: "wait", args: { milliseconds: 100 },
          uuid: expect.stringContaining("-"),
        }]
      }));
  });

  it("exceeds limit", () => {
    mockExceeded = true;
    const p = fakeProps();
    splice(p);
    expect(overwrite).not.toHaveBeenCalled();
  });
});

describe("remove()", () => {
  const fakeProps = (): RemoveParams => ({
    index: 0,
    dispatch: jest.fn(),
    sequence: fakeSequence({ body: [{ kind: "sync", args: {} }] }),
    confirmStepDeletion: false,
  });

  it("deletes step without confirmation", () => {
    const p = fakeProps();
    remove(p);
    expect(overwrite).toHaveBeenCalledWith(p.sequence,
      expect.objectContaining({ body: [] }));
  });

  it("deletes step with confirmation", () => {
    const p = fakeProps();
    p.confirmStepDeletion = true;
    window.confirm = jest.fn();
    remove(p);
    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining("delete this step?"));
    expect(overwrite).not.toHaveBeenCalled();
    window.confirm = jest.fn(() => true);
    remove(p);
    expect(overwrite).toHaveBeenCalledWith(p.sequence,
      expect.objectContaining({ body: [] }));
  });

  it("handles missing body", () => {
    const p = fakeProps();
    p.sequence.body.body = undefined;
    remove(p);
    expect(overwrite).toHaveBeenCalledWith(p.sequence,
      expect.objectContaining({ body: [] }));
  });
});

describe("updateStep()", () => {
  const fakeProps = (): StepInputProps => ({
    step: { kind: "wait", args: { milliseconds: 0 } },
    sequence: fakeSequence(),
    field: "milliseconds",
    dispatch: jest.fn(),
    index: 0,
  });

  it("updates step arg", () => {
    const p = fakeProps();
    p.sequence.body.body = undefined;
    p.step = { kind: "reboot", args: { package: "arduino_firmware" } };
    p.field = "package";
    updateStep(p)(inputEvent("farmbot_os"));
    const expectedSequence = cloneDeep(p.sequence.body);
    expectedSequence.body = [{ kind: "reboot", args: { package: "farmbot_os" } }];
    expect(overwrite).toHaveBeenCalledWith(p.sequence, expectedSequence);
  });

  it("updates step int numeric arg", () => {
    const p = fakeProps();
    updateStep(p)(inputEvent("1"));
    const expectedSequence = cloneDeep(p.sequence.body);
    expectedSequence.body = [{ kind: "wait", args: { milliseconds: 1 } }];
    expect(overwrite).toHaveBeenCalledWith(p.sequence, expectedSequence);
  });

  it("updates step float numeric arg", () => {
    const p = fakeProps();
    p.field = "x";
    p.step = {
      kind: "move_relative",
      args: { x: 1, y: 2, z: 3, speed: 100 },
    };
    updateStep(p)(inputEvent("1.1"));
    const expectedSequence = cloneDeep(p.sequence.body);
    expectedSequence.body = [{
      kind: "move_relative",
      args: { x: 1.1, y: 2, z: 3, speed: 100 },
    }];
    expect(overwrite).toHaveBeenCalledWith(p.sequence, expectedSequence);
  });
});

describe("updateStepTitle()", () => {
  const fakeProps = (): StepTitleBarProps => ({
    step: { kind: "wait", args: { milliseconds: 0 } },
    sequence: fakeSequence(),
    dispatch: jest.fn(),
    index: 0,
    pinnedSequenceName: undefined,
    toggleDraggable: jest.fn(),
    readOnly: false,
  });

  it("adds title", () => {
    const p = fakeProps();
    p.sequence.body.body = undefined;
    updateStepTitle(p)(inputEvent("title"));
    const expectedSequence = cloneDeep(p.sequence.body);
    expectedSequence.body =
      [{ kind: "wait", args: { milliseconds: 0 }, comment: "title" }];
    expect(overwrite).toHaveBeenCalledWith(p.sequence, expectedSequence);
  });

  it("removes title", () => {
    const p = fakeProps();
    p.step.comment = "title";
    updateStepTitle(p)(inputEvent(""));
    const expectedSequence = cloneDeep(p.sequence.body);
    expectedSequence.body = [{ kind: "wait", args: { milliseconds: 0 } }];
    expect(overwrite).toHaveBeenCalledWith(p.sequence, expectedSequence);
  });
});

describe("renderCeleryNode()", () => {
  const currentStep: Wait = { kind: "wait", args: { milliseconds: 100 } };

  const plant = fakePlant();
  plant.body.id = 23;

  const fakeProps = (): StepParams => ({
    ...fakeStepParams(currentStep),
    resources: buildResourceIndex([plant]).index,
  });

  interface TestData {
    node: SequenceBodyItem;
    expected: string;
  }

  const TEST_DATA: TestData[] = [
    {
      node: {
        kind: "assertion",
        args: {
          _then: { kind: "nothing", args: {} },
          assertion_type: "recover",
          lua: "lua",
        }
      },
      expected: "Lua5/3000if test failsRecover and continue"
        + "Recovery sequenceSelect a sequence",
    },
    {
      node: { kind: "lua", args: { lua: "lua" } },
      expected: "lua",
    },
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
        kind: "move",
        args: {}
      },
      expected: "location"
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
      expected: "markstrawberry plant 1 (100, 200, 0)propertyplant stageasplanted"
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
      expected: "x"
    },
    {
      node: { kind: "zero", args: { axis: "all" } },
      expected: "x"
    },
    {
      node: { kind: "calibrate", args: { axis: "all" } },
      expected: "x"
    },
    {
      node: { kind: "home", args: { axis: "all", speed: 100 } },
      expected: "x"
    },
    {
      node: { kind: "emergency_lock", args: {} },
      expected: "Unlocking a device requires user intervention"
    },
    {
      node: { kind: "reboot", args: { package: "farmbot_os" } },
      expected: ""
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

describe("stringifySequenceData()", () => {
  it("returns step contents", () => {
    expect(stringifySequenceData({
      kind: "wait",
      args: { milliseconds: 100 },
      body: [],
      ["uuid" as keyof SequenceBodyItem]: "uuid",
    }))
      .toEqual(`{
  "kind": "wait",
  "args": {
    "milliseconds": 100
  }
}`);
  });

  it("returns step contents: undefined body", () => {
    expect(stringifySequenceData({
      kind: "wait",
      args: { milliseconds: 100 },
      body: undefined,
      ["uuid" as keyof SequenceBodyItem]: "uuid",
    }))
      .toEqual(`{
  "kind": "wait",
  "args": {
    "milliseconds": 100
  }
}`);
  });
});
