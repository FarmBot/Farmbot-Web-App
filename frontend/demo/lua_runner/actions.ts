import { PercentageProgress } from "farmbot";
import { info } from "../../toast/toast";
import { store } from "../../redux/store";
import { Actions } from "../../constants";
import { validBotLocationData } from "../../util/location";
import { TOAST_OPTIONS } from "../../toast/constants";
import { Action, XyzNumber } from "./interfaces";
import { edit, save } from "../../api/crud";
import { getDeviceAccountSettings } from "../../resources/selectors";
import { UnknownAction } from "redux";
import { getFirmwareSettings, getGardenSize } from "./stubs";
import { clamp } from "lodash";

const almostEqual = (a: XyzNumber, b: XyzNumber) => {
  const epsilon = 0.01;
  return Math.abs(a.x - b.x) < epsilon &&
    Math.abs(a.y - b.y) < epsilon &&
    Math.abs(a.z - b.z) < epsilon;
};

const movementChunks = (
  current: XyzNumber,
  target: XyzNumber,
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
  const steps = Math.floor(length / 100);
  const chunks: XyzNumber[] = [];
  for (let i = 0; i <= steps; i++) {
    const step = {
      x: current.x + direction.x * 100 * i,
      y: current.y + direction.y * 100 * i,
      z: current.z + direction.z * 100 * i,
    };
    chunks.push(step);
  }
  if (!almostEqual(chunks[chunks.length - 1], target)) {
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

const expandActions = (actions: Action[]): Action[] => {
  const expanded: Action[] = [];
  const { position } = validBotLocationData(
    store.getState().bot.hardware.location_data);
  const current = {
    x: position.x as number,
    y: position.y as number,
    z: position.z as number,
  };
  const addPosition = (position: XyzNumber) => {
    expanded.push({
      type: "wait_ms",
      args: [500],
    });
    expanded.push({
      type: "move_absolute",
      args: [position.x, position.y, position.z],
    });
  };
  const setCurrent = (position: XyzNumber) => {
    current.x = position.x;
    current.y = position.y;
    current.z = position.z;
  };
  actions.map(action => {
    switch (action.type) {
      case "move_absolute":
        const moveAbsoluteTarget = clampTarget({
          x: action.args[0] as number,
          y: action.args[1] as number,
          z: action.args[2] as number,
        });
        movementChunks(current, moveAbsoluteTarget).map(addPosition);
        setCurrent(moveAbsoluteTarget);
        break;
      case "move_relative":
        const moveRelativeTarget = clampTarget({
          x: current.x + (action.args[0] as number),
          y: current.y + (action.args[1] as number),
          z: current.z + (action.args[2] as number),
        });
        movementChunks(current, moveRelativeTarget).map(addPosition);
        setCurrent(moveRelativeTarget);
        break;
      case "move":
        const moveTarget = clampTarget({
          x: (action.args[0] as number | undefined) ?? current.x,
          y: (action.args[1] as number | undefined) ?? current.y,
          z: (action.args[2] as number | undefined) ?? current.z,
        });
        movementChunks(current, moveTarget).map(addPosition);
        setCurrent(moveTarget);
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
          movementChunks(current, homeTarget).map(addPosition);
          setCurrent(homeTarget);
        });
        break;
      default:
        expanded.push(action);
        break;
    }
  });
  return expanded;
};

const pending = new Set<ReturnType<typeof setTimeout>>();

export const runActions = (actions: Action[]) => {
  let delay = 0;
  expandActions(actions).map(action => {
    // eslint-disable-next-line complexity
    const getFunc = () => {
      const estopped = store.getState().bot.hardware.informational_settings.locked;
      if (estopped && action.type !== "emergency_unlock") {
        return;
      }
      switch (action.type) {
        case "wait_ms":
          const ms = action.args[0] as number;
          delay += ms;
          return undefined;
        case "send_message":
          const type = "" + action.args[0];
          const msg = "" + action.args[1];
          return () => {
            info(msg, TOAST_OPTIONS()[type]);
          };
        case "print":
          return () => {
            console.log(action.args[0]);
          };
        case "emergency_lock":
          return () => {
            pending.forEach(clearTimeout);
            pending.clear();
            store.dispatch({
              type: Actions.DEMO_SET_ESTOP,
              payload: true,
            });
          };
        case "emergency_unlock":
          return () => {
            store.dispatch({
              type: Actions.DEMO_SET_ESTOP,
              payload: false,
            });
          };
        case "move_absolute":
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
          const status = "" + action.args[2];
          const time = action.args[3];
          const progress: PercentageProgress = {
            unit: "percent",
            percent,
            status: status as "working",
            type: "",
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
        case "update_device":
          return () => {
            const device =
              getDeviceAccountSettings(store.getState().resources.index);
            store.dispatch(edit(device, {
              mounted_tool_id: action.args[1] as number,
            }) as unknown as UnknownAction);
            store.dispatch(save(device.uuid) as unknown as UnknownAction);
          };
      }
    };
    const func = getFunc();
    func && pending.add(setTimeout(func, delay));
  });
};
