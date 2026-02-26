let mockExceeded = false;

import React from "react";
import {
  remove, move, splice, stringifySequenceData,
  updateStep, updateStepTitle,
} from "../index";
import {
  fakeSequence, fakePlant,
} from "../../../__test_support__/fake_state/resources";
import * as crud from "../../../api/crud";
import { SequenceBodyItem, Wait } from "farmbot";
import { render as rtlRender } from "@testing-library/react";
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
import * as sequenceActions from "../../actions";
import { TileAssertion } from "../tile_assertion";
import { TileLua } from "../tile_lua";
import { TileIf } from "../tile_if";
import { TileExecuteScript } from "../tile_execute_script";
import { TileExecute } from "../tile_execute";
import { TileComputedMove } from "../tile_computed_move";
import { TileMoveAbsolute } from "../tile_move_absolute";
import { TileSendMessage } from "../tile_send_message";
import { TileTakePhoto } from "../tile_take_photo";
import { TileWait } from "../tile_wait";
import { TileMarkAs } from "../tile_mark_as";
import { TileOldMarkAs } from "../tile_old_mark_as";
import { TileSetServoAngle } from "../tile_set_servo_angle";
import { TileTogglePin } from "../tile_toggle_pin";
import { TileFindHome } from "../tile_find_home";
import { TileSetZero } from "../tile_set_zero";
import { TileCalibrate } from "../tile_calibrate";
import { TileMoveHome } from "../tile_move_home";
import { TileEmergencyStop } from "../tile_emergency_stop";
import { TileReboot } from "../tile_reboot";
import { TileFirmwareAction } from "../tile_firmware_action";
import { TileShutdown } from "../tile_shutdown";
import { TileSystemAction } from "../tile_system_action";
import { TileUnknown } from "../tile_unknown";

let overwriteSpy: jest.SpyInstance;
let sequenceLengthExceededSpy: jest.SpyInstance;

beforeEach(() => {
  mockExceeded = false;
  overwriteSpy = jest.spyOn(crud, "overwrite").mockImplementation(jest.fn());
  sequenceLengthExceededSpy = jest.spyOn(sequenceActions, "sequenceLengthExceeded")
    .mockImplementation(() => mockExceeded);
});

afterEach(() => {
  overwriteSpy.mockRestore();
  sequenceLengthExceededSpy.mockRestore();
});

describe("move()", () => {
  const step1: Wait = { kind: "wait", args: { milliseconds: 100 } };
  const step2: Wait = { kind: "wait", args: { milliseconds: 200 } };
  const makeSequence = () => {
    const sequence = fakeSequence();
    sequence.body.body = [cloneDeep(step1), cloneDeep(step2)];
    return sequence;
  };

  const fakeProps = (): MoveParams => ({
    step: step2,
    sequence: makeSequence(),
    to: 0,
    from: 1,
  });

  it("moves step backward", () => {
    const p = fakeProps();
    p.from = 1;
    p.to = 0;
    move(p);
    expect(crud.overwrite).toHaveBeenCalledWith(p.sequence,
      expect.objectContaining({ body: [cloneDeep(step2), cloneDeep(step1)] }));
  });

  it("moves step forward", () => {
    const p = fakeProps();
    p.sequence.body.body = [step2, step1];
    p.from = 0;
    p.to = 2;
    move(p);
    expect(crud.overwrite).toHaveBeenCalledWith(p.sequence,
      expect.objectContaining({ body: [step1, step2] }));
  });

  it("handles missing body", () => {
    const p = fakeProps();
    p.sequence.body.body = undefined;
    p.from = 1;
    p.to = 0;
    move(p);
    expect(crud.overwrite).toHaveBeenCalledWith(p.sequence,
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
    expect(crud.overwrite).toHaveBeenCalledWith(p.sequence,
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
    expect(crud.overwrite).toHaveBeenCalledWith(p.sequence,
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
    expect(crud.overwrite).not.toHaveBeenCalled();
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
    expect(crud.overwrite).toHaveBeenCalledWith(p.sequence,
      expect.objectContaining({ body: [] }));
  });

  it("deletes step with confirmation", () => {
    const p = fakeProps();
    p.confirmStepDeletion = true;
    window.confirm = jest.fn();
    remove(p);
    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining("delete this step?"));
    expect(crud.overwrite).not.toHaveBeenCalled();
    window.confirm = jest.fn(() => true);
    remove(p);
    expect(crud.overwrite).toHaveBeenCalledWith(p.sequence,
      expect.objectContaining({ body: [] }));
  });

  it("handles missing body", () => {
    const p = fakeProps();
    p.sequence.body.body = undefined;
    remove(p);
    expect(crud.overwrite).toHaveBeenCalledWith(p.sequence,
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
    expect(p.dispatch).toHaveBeenCalledTimes(1);
  });

  it("updates step int numeric arg", () => {
    const p = fakeProps();
    updateStep(p)(inputEvent("1"));
    expect(p.dispatch).toHaveBeenCalledTimes(1);
  });

  it("updates step float numeric arg", () => {
    const p = fakeProps();
    p.field = "x";
    p.step = {
      kind: "move_relative",
      args: { x: 1, y: 2, z: 3, speed: 100 },
    };
    updateStep(p)(inputEvent("1.1"));
    expect(p.dispatch).toHaveBeenCalledTimes(1);
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
    expect(crud.overwrite).toHaveBeenCalledWith(p.sequence, expectedSequence);
  });

  it("removes title", () => {
    const p = fakeProps();
    p.step.comment = "title";
    updateStepTitle(p)(inputEvent(""));
    const expectedSequence = cloneDeep(p.sequence.body);
    expectedSequence.body = [{ kind: "wait", args: { milliseconds: 0 } }];
    expect(crud.overwrite).toHaveBeenCalledWith(p.sequence, expectedSequence);
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
    expectedType: unknown | unknown[];
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
      expectedType: [TileAssertion, "div"],
    },
    {
      node: { kind: "lua", args: { lua: "lua" } },
      expectedType: TileLua,
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
      expectedType: TileIf
    },
    {
      node: { kind: "execute_script", args: { label: "farmware-to-execute" } },
      expectedType: TileExecuteScript
    },
    {
      node: { kind: "execute", args: { sequence_id: 0 } },
      expectedType: TileExecute
    },
    {
      node: {
        kind: "move",
        args: {}
      },
      expectedType: TileComputedMove
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
      expectedType: TileMoveAbsolute
    },
    {
      node: {
        kind: "send_message",
        args: {
          message: "send this message",
          message_type: MessageType.info
        }
      },
      expectedType: TileSendMessage
    },
    {
      node: { kind: "take_photo", args: {} },
      expectedType: TileTakePhoto
    },
    {
      node: { kind: "wait", args: { milliseconds: 100 } },
      expectedType: TileWait
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
      expectedType: TileMarkAs
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
      expectedType: TileOldMarkAs
    },
    {
      node: { kind: "set_servo_angle", args: { pin_number: 4, pin_value: 90 } },
      expectedType: TileSetServoAngle
    },
    {
      node: { kind: "toggle_pin", args: { pin_number: 13 } },
      expectedType: TileTogglePin
    },
    {
      node: { kind: "find_home", args: { speed: 100, axis: "all" } },
      expectedType: TileFindHome
    },
    {
      node: { kind: "zero", args: { axis: "all" } },
      expectedType: TileSetZero
    },
    {
      node: { kind: "calibrate", args: { axis: "all" } },
      expectedType: TileCalibrate
    },
    {
      node: { kind: "home", args: { axis: "all", speed: 100 } },
      expectedType: TileMoveHome
    },
    {
      node: { kind: "emergency_lock", args: {} },
      expectedType: TileEmergencyStop
    },
    {
      node: { kind: "reboot", args: { package: "farmbot_os" } },
      expectedType: TileReboot
    },
    {
      node: { kind: "check_updates", args: { package: "farmbot_os" } },
      expectedType: TileFirmwareAction
    },
    {
      node: { kind: "factory_reset", args: { package: "farmbot_os" } },
      expectedType: TileFirmwareAction
    },
    {
      node: { kind: "sync", args: {} },
      expectedType: [TileSystemAction, TileShutdown]
    },
    {
      node: { kind: "power_off", args: {} },
      expectedType: [TileSystemAction, TileShutdown]
    },
    {
      node: { kind: "read_status", args: {} },
      expectedType: [TileSystemAction, TileShutdown]
    },
    {
      node: { kind: "emergency_unlock", args: {} },
      expectedType: [TileSystemAction, TileShutdown]
    },
    {
      node: { kind: "install_first_party_farmware", args: {} },
      expectedType: [TileSystemAction, TileShutdown]
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      node: { kind: "unknown", args: { unknown: 0 } } as any,
      expectedType: TileUnknown
    },
  ];

  it("renders correct step", () => {
    const renderActualCeleryNode =
      (jest.requireActual("../index"))
        .renderCeleryNode;
    TEST_DATA.map(test => {
      const p = fakeProps();
      p.currentStep = test.node;
      const step = renderActualCeleryNode(p);
      const element = step as { type: unknown };
      const expectedTypes =
        Array.isArray(test.expectedType) ? test.expectedType : [test.expectedType];
      const isIntrinsicType = typeof element.type == "string";
      if (!isIntrinsicType && !expectedTypes.includes(element.type)) {
        throw new Error(
          `Expected ${String(test.expectedType)} got ${String(element.type)} `
          + `for ${test.node.kind}`);
      }
      const renderStep: unknown = step;
      if (!React.isValidElement(renderStep)) {
        throw new Error(`Expected renderable step for ${test.node.kind}`);
      }
      expect(() => rtlRender(renderStep)).not.toThrow();
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
