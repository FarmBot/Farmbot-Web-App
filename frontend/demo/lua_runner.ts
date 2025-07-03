import { lua, lauxlib, lualib, to_jsstring, to_luastring } from "fengari-web";
import { findSequenceById, selectAllPoints } from "../resources/selectors";
import { ResourceIndex } from "../resources/interfaces";
import {
  ParameterApplication, PercentageProgress, SequenceBodyItem,
  TaggedFirmwareConfig, Xyz,
} from "farmbot";
import { info } from "../toast/toast";
import { store } from "../redux/store";
import { Actions } from "../constants";
import { sortGroupBy } from "../point_groups/point_group_sort";
import { validBotLocationData } from "../util/location";
import { calculateAxialLengths } from "../controls/move/direction_axes_props";
import { getFirmwareConfig } from "../resources/getters";

const runLua =
  (luaCode: string, variables: ParameterApplication[]): Action[] => {
    const actions: Action[] = [];
    const L = lauxlib.luaL_newstate(); // stack: []

    lua.lua_newtable(L); // stack: [env]

    lauxlib.luaL_requiref(L, to_luastring("_G"), lualib.luaopen_base, 1);

    lua.lua_getfield(L, -1, to_luastring("pairs"));
    lua.lua_setfield(L, -3, to_luastring("pairs"));

    lua.lua_getfield(L, -1, to_luastring("ipairs"));
    lua.lua_setfield(L, -3, to_luastring("ipairs"));

    lua.lua_pop(L, 1); // stack: [env]

    lauxlib.luaL_requiref(L, to_luastring("math"), lualib.luaopen_math, 1);
    lua.lua_setfield(L, -2, to_luastring("math"));

    lauxlib.luaL_requiref(L, to_luastring("table"), lualib.luaopen_table, 1);
    lua.lua_setfield(L, -2, to_luastring("table"));

    lua.lua_pushjsfunction(L, () => {
      let output = "";
      const n = lua.lua_gettop(L);
      for (let i = 1; i <= n; i++) {
        if (i > 1) { output += "\t"; }
        if (lua.lua_isstring(L, i)) {
          output += to_jsstring(lua.lua_tostring(L, i));
        } else if (lua.lua_isboolean(L, i)) {
          output += lua.lua_toboolean(L, i) ? "true" : "false";
        } else {
          output += "<non-printable>";
        }
      }
      actions.push({ type: "print", args: [output] });
      return 0;
    });
    lua.lua_setfield(L, -2, to_luastring("print"));

    lua.lua_pushjsfunction(L, () => {
      const variableName = to_jsstring(lua.lua_tostring(L, 1));
      const n = variables
        .filter(variable => variable.args.label === variableName)
        .map(variable => variable.args.data_value)[0];
      if (n?.kind === "numeric") {
        lua.lua_pushnumber(L, n.args.number);
      }
      return 1;
    });
    lua.lua_setfield(L, -2, to_luastring("variable"));

    lua.lua_newtable(L); // stack: [env, os]

    lua.lua_pushjsfunction(L, () => {
      const now = Math.floor(Date.now() / 1000);
      lua.lua_pushnumber(L, now);
      return 1;
    });
    lua.lua_setfield(L, -2, to_luastring("time")); // stack: [env, os]
    lua.lua_setfield(L, -2, to_luastring("os")); // stack: [env]

    lua.lua_pushjsfunction(L, () => {
      lua.lua_getfield(L, 1, to_luastring("method"));
      const method = to_jsstring(lua.lua_tostring(L, -1));
      lua.lua_pop(L, 1);

      lua.lua_getfield(L, 1, to_luastring("url"));
      const url = to_jsstring(lua.lua_tostring(L, -1));
      lua.lua_pop(L, 1);

      if (!(method == "GET" && url == "/api/points")) { return 0; }

      const points = selectAllPoints(store.getState().resources.index);
      const results = sortGroupBy("yx_alternating", points).map(p => p.body);
      lua.lua_newtable(L);
      results.forEach((result, i) => {
        lua.lua_newtable(L);
        Object.entries(result).forEach(([k, v]) => {
          lua.lua_pushstring(L, to_luastring(k));

          if (typeof v === "string") {
            lua.lua_pushstring(L, to_luastring(v));
          } else if (typeof v === "number") {
            lua.lua_pushnumber(L, v);
          } else if (typeof v === "boolean") {
            lua.lua_pushboolean(L, v);
          } else {
            lua.lua_pushnil(L);
          }
          lua.lua_settable(L, -3);
        });
        lua.lua_rawseti(L, -2, i + 1);
      });
      return 1;
    });
    lua.lua_setfield(L, -2, to_luastring("api"));

    lua.lua_pushjsfunction(L, () => {
      const n = lua.lua_gettop(L);
      const args = [];
      for (let i = 1; i <= n; i++) {
        args.push(to_jsstring(lua.lua_tostring(L, i)));
      }
      actions.push({ type: "send_message", args: args });
      return 0;
    });
    lua.lua_setfield(L, -2, to_luastring("send_message"));

    lua.lua_pushjsfunction(L, () => {
      const n = lua.lua_gettop(L);
      const args = [];
      for (let i = 1; i <= n; i++) {
        args.push(to_jsstring(lua.lua_tostring(L, i)));
      }
      actions.push({ type: "toast", args: args });
      return 0;
    });
    lua.lua_setfield(L, -2, to_luastring("toast"));

    lua.lua_pushjsfunction(L, () => {
      const jobName = to_jsstring(lua.lua_tostring(L, 1));

      lua.lua_getfield(L, 2, to_luastring("percent"));
      const percent = lua.lua_tonumber(L, -1);
      lua.lua_pop(L, 1);

      lua.lua_getfield(L, 2, to_luastring("status"));
      const status = to_jsstring(lua.lua_tostring(L, -1));
      lua.lua_pop(L, 1);

      lua.lua_getfield(L, 2, to_luastring("time"));
      const time = lua.lua_tonumber(L, -1);
      lua.lua_pop(L, 1);

      actions.push({
        type: "set_job_progress",
        args: [jobName, percent, status, time],
      });
      return 0;
    });
    lua.lua_setfield(L, -2, to_luastring("set_job_progress"));

    lua.lua_pushjsfunction(L, () => {
      const n = lua.lua_gettop(L);
      const args = [];
      for (let i = 1; i <= n; i++) {
        args.push(lua.lua_tonumber(L, i));
      }
      actions.push({ type: "move_absolute", args: args });
      return 0;
    });
    lua.lua_setfield(L, -2, to_luastring("move_absolute"));

    lua.lua_pushjsfunction(L, () => {
      const n = lua.lua_gettop(L);
      const args = [];
      for (let i = 1; i <= n; i++) {
        args.push(lua.lua_tonumber(L, i));
      }
      actions.push({ type: "move_relative", args: args });
      return 0;
    });
    lua.lua_setfield(L, -2, to_luastring("move_relative"));

    lua.lua_pushjsfunction(L, () => {
      const axis = to_jsstring(lua.lua_tostring(L, -1));
      actions.push({ type: "find_home", args: [axis] });
      return 0;
    });
    lua.lua_setfield(L, -2, to_luastring("find_home"));

    lua.lua_pushjsfunction(L, () => {
      const axis = to_jsstring(lua.lua_tostring(L, -1));
      actions.push({ type: "go_to_home", args: [axis] });
      return 0;
    });
    lua.lua_setfield(L, -2, to_luastring("go_to_home"));

    lua.lua_pushjsfunction(L, () => {
      const ms = lua.lua_tonumber(L, 1);
      actions.push({ type: "wait", args: [ms] });
      return 0;
    });
    lua.lua_setfield(L, -2, to_luastring("wait"));

    lua.lua_pushjsfunction(L, () => {
      const pin = lua.lua_tonumber(L, 1);
      const value = lua.lua_tonumber(L, 3);
      actions.push({ type: "write_pin", args: [pin, value] });
      return 0;
    });
    lua.lua_setfield(L, -2, to_luastring("write_pin"));

    lua.lua_pushjsfunction(L, () => {
      const pin = lua.lua_tonumber(L, 1);
      actions.push({ type: "toggle_pin", args: [pin] });
      return 0;
    });
    lua.lua_setfield(L, -2, to_luastring("toggle_pin"));

    lua.lua_pushjsfunction(L, () => {
      const pin = lua.lua_tonumber(L, 1);
      actions.push({ type: "on", args: [pin] });
      return 0;
    });
    lua.lua_setfield(L, -2, to_luastring("on"));

    lua.lua_pushjsfunction(L, () => {
      const pin = lua.lua_tonumber(L, 1);
      actions.push({ type: "off", args: [pin] });
      return 0;
    });
    lua.lua_setfield(L, -2, to_luastring("off"));

    lua.lua_pushjsfunction(L, () => {
      const fwConfig = getFirmwareConfig(store.getState().resources.index);
      const firmwareSettings = (fwConfig as TaggedFirmwareConfig).body;
      const { x, y, z } = calculateAxialLengths({ firmwareSettings });
      lua.lua_newtable(L);
      lua.lua_pushstring(L, to_luastring("x"));
      lua.lua_pushnumber(L, x);
      lua.lua_settable(L, -3);
      lua.lua_pushstring(L, to_luastring("y"));
      lua.lua_pushnumber(L, y);
      lua.lua_settable(L, -3);
      lua.lua_pushstring(L, to_luastring("z"));
      lua.lua_pushnumber(L, z);
      lua.lua_settable(L, -3);
      return 1;
    });
    lua.lua_setfield(L, -2, to_luastring("garden_size"));

    const statusLoad = lauxlib.luaL_loadstring(L, to_luastring(luaCode));
    if (statusLoad !== lua.LUA_OK) {
      const error = to_jsstring(lua.lua_tostring(L, -1));
      console.error("Lua load error:", error);
      return [];
    }

    lua.lua_pushvalue(L, -2);
    lua.lua_setupvalue(L, -2, 1);

    const statusCall = lua.lua_pcall(L, 0, lua.LUA_MULTRET, 0);
    if (statusCall !== lua.LUA_OK) {
      const errorVal = lua.lua_tostring(L, -1);
      const error = to_jsstring(errorVal);
      console.error("Lua call error:", error);
      return [];
    }
    return actions;
  };

export const runDemoLuaCode = (luaCode: string) => {
  const actions = runLua(luaCode, []);
  runActions(actions);
};

export const runDemoSequence = (
  resources: ResourceIndex,
  sequenceId: number,
  variables: ParameterApplication[] | undefined,
) => {
  const sequence = findSequenceById(resources, sequenceId);
  const actions: Action[] = [];
  (sequence.body.body as SequenceBodyItem[]).map(step => {
    if (step.kind === "lua") {
      const stepActions = runLua(step.args.lua, variables || []);
      actions.push(...stepActions);
    }
  });
  runActions(actions);
};

interface Action {
  type: "move_absolute"
  | "move_relative"
  | "toggle_pin"
  | "on"
  | "off"
  | "find_home"
  | "go_to_home"
  | "toast"
  | "send_message"
  | "print"
  | "wait"
  | "write_pin"
  | "set_job_progress";
  args: (number | string)[];
}

const almostEqual = (a: Record<Xyz, number>, b: Record<Xyz, number>) => {
  const epsilon = 0.01;
  return Math.abs(a.x - b.x) < epsilon &&
    Math.abs(a.y - b.y) < epsilon &&
    Math.abs(a.z - b.z) < epsilon;
};

const movementChunks = (
  current: Record<Xyz, number>,
  target: Record<Xyz, number>,
): Record<Xyz, number>[] => {
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
  const chunks: Record<Xyz, number>[] = [];
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

const expandActions = (actions: Action[]): Action[] => {
  const expanded: Action[] = [];
  const { position } = validBotLocationData(
    store.getState().bot.hardware.location_data);
  const current = {
    x: position.x as number,
    y: position.y as number,
    z: position.z as number,
  };
  const addPosition = (position: Record<Xyz, number>) => {
    expanded.push({
      type: "wait",
      args: [500],
    });
    expanded.push({
      type: "move_absolute",
      args: [position.x, position.y, position.z],
    });
  };
  const setCurrent = (position: Record<Xyz, number>) => {
    current.x = position.x;
    current.y = position.y;
    current.z = position.z;
  };
  actions.map(action => {
    switch (action.type) {
      case "move_absolute":
        const target = {
          x: action.args[0] as number,
          y: action.args[1] as number,
          z: action.args[2] as number,
        };
        movementChunks(current, target).map(addPosition);
        setCurrent(target);
        break;
      case "move_relative":
        const moveRelativeTarget = {
          x: current.x + (action.args[0] as number),
          y: current.y + (action.args[1] as number),
          z: current.z + (action.args[2] as number),
        };
        movementChunks(current, moveRelativeTarget).map(addPosition);
        setCurrent(moveRelativeTarget);
        break;
      case "find_home":
      case "go_to_home":
        const axis = action.args[0] as string;
        const homeTarget = {
          x: ["all", "x"].includes(axis) ? 0 : current.x,
          y: ["all", "y"].includes(axis) ? 0 : current.y,
          z: ["all", "z"].includes(axis) ? 0 : current.z,
        };
        movementChunks(current, homeTarget).map(addPosition);
        setCurrent(homeTarget);
        break;
      case "on":
      case "off":
        const pin = action.args[0] as number;
        const value = action.type === "on" ? 1 : 0;
        expanded.push({ type: "write_pin", args: [pin, value] });
        break;
      default:
        expanded.push(action);
        break;
    }
  });
  return expanded;
};

const runActions = (actions: Action[]) => {
  let delay = 0;
  expandActions(actions).map(action => {
    const getFunc = () => {
      switch (action.type) {
        case "wait":
          const ms = action.args[0] as number;
          delay += ms;
          return undefined;
        case "toast":
        case "send_message":
          const type = "" + action.args[0];
          const msg = "" + action.args[1];
          if (type == "info") {
            return () => {
              info(msg);
            };
          }
          return undefined;
        case "print":
          return () => {
            console.log(action.args[0]);
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
          const value = action.args[1] as number;
          return () => {
            store.dispatch({
              type: Actions.DEMO_WRITE_PIN,
              payload: { pin, value },
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
      }
    };
    const func = getFunc();
    func && setTimeout(func, delay);
  });
};
