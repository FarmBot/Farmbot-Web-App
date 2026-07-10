import {
  ALLOWED_CHANNEL_NAMES,
  MoveBodyItem,
  ParameterApplication,
  PercentageProgress,
} from "farmbot";
import { error, info } from "../../toast/toast";
import { store } from "../../redux/store";
import { Actions } from "../../constants";
import { TOAST_OPTIONS } from "../../toast/constants";
import { Action, XyzNumber } from "./interfaces";
import * as crud from "../../api/crud";
import { getDeviceAccountSettings } from "../../resources/selectors";
import { UnknownAction } from "redux";
import { getFirmwareSettings, getGardenSize } from "./stubs";
import { clamp, random } from "lodash";
import { Point } from "farmbot/dist/resources/api_resources";
import { calculateMove } from "./calculate_move";
import { t } from "../../i18next_wrapper";
import { API } from "../../api";
import { isMessageType } from "../../sequences/interfaces";
import {
  cancelDemoMovement, demoMovementActive, startDemoMovement,
} from "./movement";

const clampTarget = (target: XyzNumber): XyzNumber => {
  const firmwareConfig = getFirmwareSettings();
  const bounds = getGardenSize();
  const clamped = {
    x: clamp(target.x, 0, bounds.x),
    y: clamp(target.y, 0, bounds.y),
    z: firmwareConfig.movement_home_up_z
      ? clamp(target.z, -bounds.z, 0)
      : clamp(target.z, 0, bounds.z),
  };
  return clamped;
};

const current = {
  x: 0,
  y: 0,
  z: 0,
};

export const setCurrent = (position: XyzNumber) => {
  current.x = position.x;
  current.y = position.y;
  current.z = position.z;
};

export interface ExpandedActionsResult {
  actions: Action[];
  current: XyzNumber;
}

export const expandActionsFromPosition = (
  actions: Action[],
  variables: ParameterApplication[] | undefined,
  startPosition: XyzNumber,
): ExpandedActionsResult => {
  const expanded: Action[] = [];
  const expansionCurrent = { ...startPosition };
  const setExpansionCurrent = (position: XyzNumber) => {
    expansionCurrent.x = position.x;
    expansionCurrent.y = position.y;
    expansionCurrent.z = position.z;
  };
  const addPosition = (position: XyzNumber) => {
    expanded.push({
      type: "animated_move_absolute",
      args: [position.x, position.y, position.z],
    });
  };
  const start = () => { expanded.push({ type: "busy", args: [1] }); };
  const stop = () => { expanded.push({ type: "busy", args: [0] }); };
  // eslint-disable-next-line complexity
  actions.map(action => {
    switch (action.type) {
      case "move_absolute":
        const moveAbsoluteTarget = clampTarget({
          x: action.args[0] as number,
          y: action.args[1] as number,
          z: action.args[2] as number,
        });
        start();
        addPosition(moveAbsoluteTarget);
        stop();
        setExpansionCurrent(moveAbsoluteTarget);
        break;
      case "move_relative":
        const moveRelativeTarget = clampTarget({
          x: expansionCurrent.x + (action.args[0] as number),
          y: expansionCurrent.y + (action.args[1] as number),
          z: expansionCurrent.z + (action.args[2] as number),
        });
        start();
        addPosition(moveRelativeTarget);
        stop();
        setExpansionCurrent(moveRelativeTarget);
        break;
      case "_move":
        const moveItems = JSON.parse("" + action.args[0]) as MoveBodyItem[];
        const { moves, warnings } =
          calculateMove(moveItems, expansionCurrent, variables);
        warnings.length > 0 && expanded.push({
          type: "send_message",
          args: [
            "warn",
            `not yet supported: ${warnings.join(", ")}`,
            "",
            JSON.stringify(expansionCurrent),
          ],
        });
        const actualMoveTargets = moves.map(clampTarget);
        start();
        actualMoveTargets.map(actualMoveTarget => {
          addPosition(actualMoveTarget);
          setExpansionCurrent(actualMoveTarget);
        });
        stop();
        break;
      case "send_message":
        const sendMessageArgs = [...action.args];
        sendMessageArgs[3] = JSON.stringify(expansionCurrent);
        expanded.push({ type: "send_message", args: sendMessageArgs });
        break;
      case "take_photo":
      case "calibrate_camera":
      case "detect_weeds":
      case "measure_soil_height":
        const MSGS = {
          "take_photo": "Taking photo",
          "calibrate_camera": "Calibrating camera",
          "detect_weeds": "Running weed detector",
          "measure_soil_height": "Executing Measure Soil Height",
        };
        const DELAYS = {
          "take_photo": 5,
          "calibrate_camera": 15,
          "detect_weeds": 15,
          "measure_soil_height": 15,
        };
        expanded.push({
          type: "send_message",
          args: [
            "info",
            MSGS[action.type],
            "",
            JSON.stringify(expansionCurrent),
            3,
          ],
        });
        expanded.push({
          type: "wait_ms",
          args: [(DELAYS[action.type] - 3) * 1000],
        });
        expanded.push({
          type: "take_photo",
          args: [
            expansionCurrent.x,
            expansionCurrent.y,
            expansionCurrent.z,
          ],
        });
        expanded.push({
          type: "send_message",
          args: [
            "info",
            "Uploaded image:",
            "",
            JSON.stringify(expansionCurrent),
            3,
          ],
        });
        if (action.type === "measure_soil_height") {
          const body: Point = {
            name: "Soil Height",
            pointer_type: "GenericPointer",
            x: expansionCurrent.x,
            y: expansionCurrent.y,
            z: -500 + random(-10, 10),
            meta: { at_soil_level: "true" },
            radius: 0,
          };
          const point = JSON.stringify(body);
          expanded.push({ type: "create_point", args: [point] });
        }
        if (action.type === "detect_weeds") {
          const body: Point = {
            name: "Weed",
            pointer_type: "Weed",
            x: expansionCurrent.x,
            y: expansionCurrent.y,
            z: -500,
            meta: { color: "red", created_by: "plant-detection" },
            radius: 50,
            plant_stage: "pending",
          };
          const point = JSON.stringify(body);
          expanded.push({ type: "create_point", args: [point] });
        }
        break;
      case "find_home":
      case "go_to_home":
        const axisInput = action.args[0] as string;
        const axes = axisInput == "all" ? ["z", "y", "x"] : [axisInput];
        axes.map(axis => {
          const homeTarget = {
            x: axis == "x" ? 0 : expansionCurrent.x,
            y: axis == "y" ? 0 : expansionCurrent.y,
            z: axis == "z" ? 0 : expansionCurrent.z,
          };
          addPosition(homeTarget);
          setExpansionCurrent(homeTarget);
        });
        break;
      case "read_pin":
        const pin = action.args[0] as number;
        expanded.push({
          type: "sensor_reading",
          args: [
            pin,
            expansionCurrent.x,
            expansionCurrent.y,
            expansionCurrent.z,
          ],
        });
        break;
      case "animated_move_absolute":
        const expandedMoveTarget = {
          x: action.args[0] as number,
          y: action.args[1] as number,
          z: action.args[2] as number,
        };
        expanded.push({
          type: "animated_move_absolute",
          args: [
            expandedMoveTarget.x,
            expandedMoveTarget.y,
            expandedMoveTarget.z,
          ],
        });
        setExpansionCurrent(expandedMoveTarget);
        break;
      default:
        expanded.push({ type: action.type, args: [...action.args] });
        break;
    }
  });
  return {
    actions: expanded,
    current: { ...expansionCurrent },
  };
};

export const expandActions = (
  actions: Action[],
  variables: ParameterApplication[] | undefined,
  stashedCurrentPosition?: XyzNumber,
): Action[] => {
  const startPosition = stashedCurrentPosition || current;
  const result = expandActionsFromPosition(actions, variables, startPosition);
  if (!stashedCurrentPosition) { setCurrent(result.current); }
  return result.actions;
};

interface Scheduled {
  func(done: () => void): (() => void) | undefined;
  delay: number;
}
const pending: Scheduled[] = [];
let currentTimer: ReturnType<typeof setTimeout> | undefined = undefined;
let activeCancellation: (() => void) | undefined;
let activeToken = 0;
let actionRunning = false;

export const syncCurrentFromBotPosition = () => {
  if (pending.length > 0 || actionRunning || demoMovementActive()) { return; }
  const position = store.getState().bot.hardware.location_data?.position;
  if (typeof position?.x != "number" ||
    typeof position.y != "number" ||
    typeof position.z != "number") { return; }
  setCurrent({ x: position.x, y: position.y, z: position.z });
};

export const eStop = () => {
  activeToken++;
  pending.length = 0;
  actionRunning = false;
  currentTimer && clearTimeout(currentTimer);
  currentTimer = undefined;
  activeCancellation?.();
  activeCancellation = undefined;
  const stoppedPosition = cancelDemoMovement();
  if (stoppedPosition) {
    store.dispatch({
      type: Actions.DEMO_SET_POSITION,
      payload: stoppedPosition,
    });
    setCurrent(stoppedPosition);
  }
  store.dispatch({
    type: Actions.DEMO_SET_ESTOP,
    payload: true,
  });
};

export const runActions = (
  actions: Action[],
) => {
  let delay = 0;
  let notified = false;
  actions.map(action => {
    const estopped =
      store.getState().bot.hardware.informational_settings.locked;
    if (estopped && action.type !== "emergency_unlock") {
      if (!notified) {
        info(t("Command not available while locked."), {
          ...TOAST_OPTIONS().error,
          title: t("Emergency stop active"),
        });
        notified = true;
      }
      return;
    }
    if (action.type == "wait_ms") {
      delay += action.args[0] as number;
      return;
    }
    if (action.type == "animated_move_absolute") {
      const position = {
        x: action.args[0] as number,
        y: action.args[1] as number,
        z: action.args[2] as number,
      };
      pending.push({
        delay,
        func: done => startDemoMovement(position, done),
      });
      delay = 0;
      runNext();
      return;
    }
    // eslint-disable-next-line complexity
    const getFunc = () => {
      switch (action.type) {
        case "send_message":
          const type = "" + action.args[0];
          if (!isMessageType(type)) {
            return () => {
              error(`Invalid message type: ${type}`);
            };
          }
          const msg = "" + action.args[1];
          const channelsStr = "" + action.args[2];
          const channels = channelsStr.split(",") as ALLOWED_CHANNEL_NAMES[];
          const logPosition = JSON.parse("" + action.args[3]) as XyzNumber;
          const verbosity = action.args[4] as number;
          return () => {
            if (channels.includes("toast")) {
              info(msg, TOAST_OPTIONS()[type]);
            }
            const initAction = crud.init("Log", {
              message: msg,
              type: type,
              ...logPosition,
              channels,
              verbosity,
            });
            store.dispatch(initAction as unknown as UnknownAction);
            setTimeout(() => {
              store.dispatch(
                crud.save(initAction.payload.uuid) as unknown as UnknownAction);
            }, 20000);
          };
        case "print":
          return () => {
            console.log(action.args[0]);
          };
        case "take_photo":
          return () => {
            const timestamp = (new Date()).toISOString();
            store.dispatch(crud.initSave("Image", {
              attachment_url: API.current.baseUrl + "/soil.png",
              created_at: timestamp,
              meta: {
                x: action.args[0] as number,
                y: action.args[1] as number,
                z: action.args[2] as number,
                name: "demo.png",
              },
            }) as unknown as UnknownAction);
          };
        case "emergency_lock":
          return eStop;
        case "emergency_unlock":
          return () => {
            store.dispatch({
              type: Actions.DEMO_SET_ESTOP,
              payload: false,
            });
          };
        case "busy":
          const busy = action.args[0] as number;
          return () => {
            store.dispatch({
              type: Actions.DEMO_SET_BUSY,
              payload: !!busy,
            });
          };
        case "toggle_pin":
          return () => {
            store.dispatch({
              type: Actions.DEMO_TOGGLE_PIN,
              payload: action.args[0] as number,
            });
          };
        case "sensor_reading":
          return () => {
            store.dispatch(crud.initSave("SensorReading", {
              pin: action.args[0] as number,
              mode: 1,
              x: action.args[1] as number,
              y: action.args[2] as number,
              z: action.args[3] as number,
              value: random(0, 1024),
              read_at: (new Date()).toISOString(),
            }) as unknown as UnknownAction);
          };
        case "write_pin":
          const pin = action.args[0] as number;
          const mode = action.args[1] as string;
          const value = action.args[2] as number;
          return () => {
            store.dispatch({
              type: Actions.DEMO_WRITE_PIN,
              payload: { pin, mode, value },
            });
          };
        case "set_job_progress":
          const job = "" + action.args[0];
          const percent = action.args[1] as number;
          const status = action.args[2];
          const time = action.args[3];
          const progress: PercentageProgress = {
            unit: "percent",
            percent: percent || 0,
            status: (status || "Working") as "working",
            type: "unknown",
            file_type: "",
            updated_at: (new Date()).valueOf() / 1000,
            time: (status == "Complete" ? undefined : time) as string,
          };
          return () => {
            store.dispatch({
              type: Actions.DEMO_SET_JOB_PROGRESS,
              payload: [job, progress],
            });
          };
        case "create_point":
          const point = JSON.parse("" + action.args[0]) as Point;
          point.meta = point.meta || {};
          return () => {
            store.dispatch(
              crud.initSave("Point", point) as unknown as UnknownAction);
          };
        case "update_device":
          return () => {
            const device =
              getDeviceAccountSettings(store.getState().resources.index);
            store.dispatch(crud.edit(device, {
              mounted_tool_id: action.args[1] as number,
            }) as unknown as UnknownAction);
            store.dispatch(crud.save(device.uuid) as unknown as UnknownAction);
          };
      }
    };
    const func = getFunc();
    if (func) {
      pending.push({
        delay,
        func: done => {
          func();
          done();
          return undefined;
        },
      });
      delay = 0;
      runNext();
    }
  });
};

const runNext = () => {
  if (currentTimer || actionRunning || pending.length === 0) {
    return;
  }
  const next = pending.shift() as Scheduled;
  const token = ++activeToken;
  actionRunning = true;
  currentTimer = setTimeout(() => {
    currentTimer = undefined;
    if (!actionRunning || token != activeToken) { return; }
    const done = () => {
      if (!actionRunning || token != activeToken) { return; }
      actionRunning = false;
      activeCancellation = undefined;
      store.dispatch({
        type: Actions.DEMO_SET_QUEUE_LENGTH,
        payload: pending.length,
      });
      runNext();
    };
    const cancellation = next.func(done);
    if (actionRunning && token == activeToken) {
      activeCancellation = cancellation;
    }
  }, next.delay);
};
