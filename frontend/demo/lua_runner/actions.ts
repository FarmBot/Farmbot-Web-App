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
import { validBotLocationData } from "../../util/location";
import { Point } from "farmbot/dist/resources/api_resources";
import { calculateMove } from "./calculate_move";
import { t } from "../../i18next_wrapper";
import { API } from "../../api";
import { isMessageType } from "../../sequences/interfaces";

const almostEqual = (a: XyzNumber, b: XyzNumber) => {
  const epsilon = 0.01;
  return Math.abs(a.x - b.x) < epsilon &&
    Math.abs(a.y - b.y) < epsilon &&
    Math.abs(a.z - b.z) < epsilon;
};

const movementChunks = (
  current: XyzNumber,
  target: XyzNumber,
  mmPerTimeStep: number,
): XyzNumber[] => {
  const dx = target.x - current.x;
  const dy = target.y - current.y;
  const dz = target.z - current.z;

  const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (length === 0) { return [target]; }
  const direction = {
    x: dx / length,
    y: dy / length,
    z: dz / length,
  };
  const steps = localStorage.getItem("DISABLE_CHUNKING") === "true"
    ? 0
    : Math.floor(length / mmPerTimeStep);
  const chunks: XyzNumber[] = [];
  for (let i = 1; i <= steps; i++) {
    const step = {
      x: current.x + direction.x * mmPerTimeStep * i,
      y: current.y + direction.y * mmPerTimeStep * i,
      z: current.z + direction.z * mmPerTimeStep * i,
    };
    chunks.push(step);
  }
  if (chunks.length === 0 || !almostEqual(chunks[chunks.length - 1], target)) {
    chunks.push(target);
  }
  return chunks;
};

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

export const expandActions = (
  actions: Action[],
  variables: ParameterApplication[] | undefined,
  stashedCurrentPosition?: XyzNumber,
): Action[] => {
  const expanded: Action[] = [];
  const timeStepMs = parseInt(localStorage.getItem("timeStepMs") || "250");
  const mmPerSecond = parseInt(localStorage.getItem("mmPerSecond") || "500");
  const mmPerTimeStep = (mmPerSecond * timeStepMs) / 1000;
  const addPosition = (position: XyzNumber) => {
    expanded.push({
      type: "wait_ms",
      args: [timeStepMs],
    });
    expanded.push({
      type: "expanded_move_absolute",
      args: [position.x, position.y, position.z],
    });
  };
  // eslint-disable-next-line complexity
  actions.map(action => {
    switch (action.type) {
      case "move_absolute":
        const moveAbsoluteTarget = clampTarget({
          x: action.args[0] as number,
          y: action.args[1] as number,
          z: action.args[2] as number,
        });
        movementChunks(current, moveAbsoluteTarget, mmPerTimeStep).map(addPosition);
        setCurrent(moveAbsoluteTarget);
        break;
      case "move_relative":
        const moveRelativeTarget = clampTarget({
          x: current.x + (action.args[0] as number),
          y: current.y + (action.args[1] as number),
          z: current.z + (action.args[2] as number),
        });
        movementChunks(current, moveRelativeTarget, mmPerTimeStep).map(addPosition);
        setCurrent(moveRelativeTarget);
        break;
      case "_move":
        const moveItems = JSON.parse("" + action.args[0]) as MoveBodyItem[];
        const { moves, warnings } = calculateMove(moveItems, current, variables);
        warnings.length > 0 && expanded.push({
          type: "send_message",
          args: [
            "warn",
            `not yet supported: ${warnings.join(", ")}`,
            "",
            JSON.stringify(current),
          ],
        });
        const actualMoveTargets = moves.map(clampTarget);
        actualMoveTargets.map(actualMoveTarget => {
          movementChunks(current, actualMoveTarget, mmPerTimeStep).map(addPosition);
          setCurrent(actualMoveTarget);
        });
        break;
      case "send_message":
        action.args[3] = JSON.stringify(current);
        expanded.push({ type: "send_message", args: action.args });
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
            JSON.stringify(current),
            3,
          ],
        });
        expanded.push({
          type: "wait_ms",
          args: [(DELAYS[action.type] - 3) * 1000],
        });
        expanded.push({
          type: "take_photo",
          args: [current.x, current.y, current.z],
        });
        expanded.push({
          type: "send_message",
          args: [
            "info",
            "Uploaded image:",
            "",
            JSON.stringify(current),
            3,
          ],
        });
        if (action.type === "measure_soil_height") {
          const body: Point = {
            name: "Soil Height",
            pointer_type: "GenericPointer",
            x: current.x,
            y: current.y,
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
            x: current.x,
            y: current.y,
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
            x: axis == "x" ? 0 : current.x,
            y: axis == "y" ? 0 : current.y,
            z: axis == "z" ? 0 : current.z,
          };
          movementChunks(current, homeTarget, mmPerTimeStep).map(addPosition);
          setCurrent(homeTarget);
        });
        break;
      case "read_pin":
        const pin = action.args[0] as number;
        expanded.push({
          type: "sensor_reading",
          args: [
            pin,
            current.x,
            current.y,
            current.z,
          ],
        });
        break;
      default:
        expanded.push(action);
        break;
    }
  });
  if (stashedCurrentPosition) {
    setCurrent(stashedCurrentPosition);
  }
  return expanded;
};

interface Scheduled {
  func(): void;
  timestamp: number;
}
const pending: Scheduled[] = [];
let latestActionMs = Date.now();
let currentTimer: ReturnType<typeof setTimeout> | undefined = undefined;

export const eStop = () => {
  latestActionMs = 0;
  pending.length = 0;
  store.dispatch({
    type: Actions.DEMO_SET_ESTOP,
    payload: true,
  });
  const { position } = validBotLocationData(
    store.getState().bot.hardware.location_data);
  current.x = position.x as number;
  current.y = position.y as number;
  current.z = position.z as number;
};

export const runActions = (
  actions: Action[],
) => {
  let delay = 0;
  let notified = false;
  actions.map(action => {
    // eslint-disable-next-line complexity
    const getFunc = () => {
      const estopped = store.getState().bot.hardware.informational_settings.locked;
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
      switch (action.type) {
        case "wait_ms":
          const ms = action.args[0] as number;
          delay += ms;
          return undefined;
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
        case "expanded_move_absolute":
          const x = action.args[0] as number;
          const y = action.args[1] as number;
          const z = action.args[2] as number;
          const position = { x, y, z };
          return () => {
            store.dispatch({
              type: Actions.DEMO_SET_POSITION,
              payload: position,
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
            store.dispatch(crud.initSave("Point", point) as unknown as UnknownAction);
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
      latestActionMs = Math.max(latestActionMs, Date.now()) + delay;
      const item = { func, timestamp: latestActionMs };
      pending.push(item);
      delay = 0;
      runNext();
    }
  });
};

const runNext = () => {
  if (currentTimer || pending.length === 0) {
    return;
  }
  const next = pending[0];
  const delay = Math.max(next.timestamp - Date.now(), 0);

  currentTimer = setTimeout(() => {
    currentTimer = undefined;
    const task = pending.shift();
    task?.func();
    store.dispatch({
      type: Actions.DEMO_SET_QUEUE_LENGTH,
      payload: pending.length,
    });
    runNext();
  }, delay);
};
