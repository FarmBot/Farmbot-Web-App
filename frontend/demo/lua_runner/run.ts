import { lua, lauxlib, lualib, to_luastring } from "fengari-web";
import {
  getDeviceAccountSettings,
  selectAllPoints, selectAllTools, selectAllToolSlotPointers,
} from "../../resources/selectors";
import {
  ParameterApplication, RpcRequest, TaggedFirmwareConfig,
  Xyz,
} from "farmbot";
import { store } from "../../redux/store";
import { sortGroupBy } from "../../point_groups/point_group_sort";
import { calculateAxialLengths } from "../../controls/move/direction_axes_props";
import { getFirmwareConfig } from "../../resources/getters";
import { LUA_HELPERS } from "./lua";
import { createRecursiveNotImplemented, csToLua, jsToLua, luaToJs } from "./util";
import { Action } from "./interfaces";
import { DeviceAccountSettings } from "farmbot/dist/resources/api_resources";

export const runLua =
  (luaCode: string, variables: ParameterApplication[]): Action[] => {
    const actions: Action[] = [];
    const L = lauxlib.luaL_newstate(); // stack: []

    lua.lua_newtable(L); // stack: [env]
    const envIndex = lua.lua_gettop(L);

    lauxlib.luaL_requiref(L, to_luastring("_G"), lualib.luaopen_base, 1);
    const gIndex = lua.lua_gettop(L);

    lua.lua_getfield(L, gIndex, to_luastring("type"));
    lua.lua_setfield(L, envIndex, to_luastring("type"));

    lua.lua_getfield(L, gIndex, to_luastring("tostring"));
    lua.lua_setfield(L, envIndex, to_luastring("tostring"));

    lua.lua_getfield(L, gIndex, to_luastring("tonumber"));
    lua.lua_setfield(L, envIndex, to_luastring("tonumber"));

    lua.lua_getfield(L, gIndex, to_luastring("pairs"));
    lua.lua_setfield(L, envIndex, to_luastring("pairs"));

    lua.lua_getfield(L, gIndex, to_luastring("ipairs"));
    lua.lua_setfield(L, envIndex, to_luastring("ipairs"));

    lua.lua_pop(L, 1); // stack: [env]

    lauxlib.luaL_requiref(L, to_luastring("math"), lualib.luaopen_math, 1);
    lua.lua_setfield(L, envIndex, to_luastring("math"));

    lauxlib.luaL_requiref(L, to_luastring("table"), lualib.luaopen_table, 1);
    lua.lua_setfield(L, envIndex, to_luastring("table"));

    lauxlib.luaL_requiref(L, to_luastring("string"), lualib.luaopen_string, 1);
    lua.lua_setfield(L, envIndex, to_luastring("string"));

    lua.lua_pushjsfunction(L, () => {
      let output = "";
      const n = lua.lua_gettop(L);
      for (let i = 1; i <= n; i++) {
        if (i > 1) { output += "\t"; }
        if (lua.lua_isstring(L, i)) {
          output += luaToJs(L, i);
        } else {
          output += JSON.stringify(luaToJs(L, i));
        }
      }
      actions.push({ type: "print", args: [output] });
      return 0;
    });
    lua.lua_setfield(L, envIndex, to_luastring("print"));

    lua.lua_pushjsfunction(L, () => {
      const variableName = luaToJs(L, 1) as string;
      const n = variables
        .filter(variable => variable.args.label === variableName)
        .map(variable => variable.args.data_value)[0];
      switch (n?.kind) {
        case "numeric":
          jsToLua(L, n.args.number);
          break;
        case "text":
          jsToLua(L, n.args.string);
          break;
        case "coordinate":
          jsToLua(L, n.args);
          break;
        case "point":
          const point = selectAllPoints(store.getState().resources.index)
            .find(p => p.body.id === n.args.pointer_id)?.body;
          jsToLua(L, point);
          break;
        case "tool":
          const slot = selectAllToolSlotPointers(store.getState().resources.index)
            .find(ts => ts.body.tool_id === n.args.tool_id)?.body;
          jsToLua(L, slot);
          break;
        default:
          actions.push({
            type: "send_message",
            args: [
              "error",
              `Variable "${variableName}" of type ${n?.kind} not implemented.`,
              "toast",
            ],
          });
          lua.lua_pushnil(L);
          break;
      }
      return 1;
    });
    lua.lua_setfield(L, envIndex, to_luastring("variable"));

    // stack: [env]
    lauxlib.luaL_requiref(L, to_luastring("os"), lualib.luaopen_os, 1);
    // stack: [env, os]
    const osIndex = lua.lua_gettop(L);
    lua.lua_newtable(L);
    const envOsIndex = lua.lua_gettop(L);
    lua.lua_getfield(L, osIndex, to_luastring("time"));
    lua.lua_setfield(L, envOsIndex, to_luastring("time"));
    lua.lua_getfield(L, osIndex, to_luastring("date"));
    lua.lua_setfield(L, envOsIndex, to_luastring("date"));
    lua.lua_setfield(L, envIndex, to_luastring("os"));
    lua.lua_pop(L, 1); // stack: [env]

    lua.lua_pushjsfunction(L, () => {
      lua.lua_getfield(L, 1, to_luastring("method"));
      const method = lua.lua_isnil(L, -1)
        ? "GET"
        : luaToJs(L, -1) as string;
      lua.lua_pop(L, 1);

      lua.lua_getfield(L, 1, to_luastring("url"));
      const rawUrl = luaToJs(L, -1) as string;
      const url = rawUrl.replace(/\/$/, "");
      lua.lua_pop(L, 1);

      if (method == "GET" && url == "/api/points") {
        const points = selectAllPoints(store.getState().resources.index);
        const results = sortGroupBy("yx_alternating", points).map(p => p.body);
        jsToLua(L, results);
        return 1;
      } else if (method == "GET" && url == "/api/tools") {
        const results = selectAllTools(store.getState().resources.index)
          .map(p => p.body);
        jsToLua(L, results);
        return 1;
      } else {
        actions.push({
          type: "send_message",
          args: [
            "error",
            `API call ${method} ${url} not implemented.`,
            "toast",
          ],
        });
        jsToLua(L, false);
        return 1;
      }
    });
    lua.lua_setfield(L, envIndex, to_luastring("api"));

    lua.lua_pushjsfunction(L, () => {
      const cmd = (luaToJs(L, 1) as RpcRequest).body?.[0];
      if (!cmd) { return 0; }
      const luaActions = runLua(csToLua(cmd), variables);
      actions.push(...luaActions);
      return 0;
    });
    lua.lua_setfield(L, envIndex, to_luastring("cs_eval"));

    lua.lua_pushjsfunction(L, () => {
      const n = lua.lua_gettop(L);
      const args = [];
      for (let i = 1; i <= n; i++) {
        args.push(luaToJs(L, i) as string);
      }
      actions.push({ type: "send_message", args: args });
      return 0;
    });
    lua.lua_setfield(L, envIndex, to_luastring("send_message"));

    lua.lua_pushjsfunction(L, () => {
      const jobName = luaToJs(L, 1) as string;

      lua.lua_getfield(L, 2, to_luastring("percent"));
      const percent = luaToJs(L, -1) as number;
      lua.lua_pop(L, 1);

      lua.lua_getfield(L, 2, to_luastring("status"));
      const status = luaToJs(L, -1) as string;
      lua.lua_pop(L, 1);

      lua.lua_getfield(L, 2, to_luastring("time"));
      const time = luaToJs(L, -1) as number;
      lua.lua_pop(L, 1);

      actions.push({
        type: "set_job_progress",
        args: [jobName, percent, status, time],
      });
      return 0;
    });
    lua.lua_setfield(L, envIndex, to_luastring("set_job_progress"));

    lua.lua_pushjsfunction(L, () => {
      const args = [];
      const n = lua.lua_gettop(L);
      if (n == 1) {
        const params = luaToJs(L, 1) as Record<Xyz, number>;
        ["x", "y", "z"].map((axis: Xyz) => args.push(params[axis]));
      } else {
        for (let i = 1; i <= n; i++) {
          args.push(luaToJs(L, i) as number);
        }
      }
      actions.push({ type: "move_absolute", args: args });
      return 0;
    });
    lua.lua_setfield(L, envIndex, to_luastring("move_absolute"));

    lua.lua_pushjsfunction(L, () => {
      const n = lua.lua_gettop(L);
      const args = [];
      for (let i = 1; i <= n; i++) {
        args.push(luaToJs(L, i) as number);
      }
      actions.push({ type: "move_relative", args: args });
      return 0;
    });
    lua.lua_setfield(L, envIndex, to_luastring("move_relative"));

    lua.lua_pushjsfunction(L, () => {
      const axis = luaToJs(L, -1) as string;
      actions.push({ type: "find_home", args: [axis] });
      return 0;
    });
    lua.lua_setfield(L, envIndex, to_luastring("find_home"));

    lua.lua_pushjsfunction(L, () => {
      const axis = luaToJs(L, -1) as string;
      actions.push({ type: "go_to_home", args: [axis] });
      return 0;
    });
    lua.lua_setfield(L, envIndex, to_luastring("go_to_home"));

    lua.lua_pushjsfunction(L, () => {
      const ms = luaToJs(L, 1) as number;
      actions.push({ type: "wait_ms", args: [ms] });
      return 0;
    });
    lua.lua_setfield(L, envIndex, to_luastring("wait_ms"));

    lua.lua_pushjsfunction(L, () => {
      const key = luaToJs(L, 1) as keyof DeviceAccountSettings;
      const device = getDeviceAccountSettings(store.getState().resources.index);
      const value = device.body[key];
      jsToLua(L, value || false);
      return 1;
    });
    lua.lua_setfield(L, envIndex, to_luastring("get_device"));

    lua.lua_pushjsfunction(L, () => {
      const params = luaToJs(L, 1) as Object;
      const [key, value] = Object.entries(params)[0];
      actions.push({ type: "update_device", args: [key, value] });
      return 0;
    });
    lua.lua_setfield(L, envIndex, to_luastring("update_device"));

    lua.lua_pushjsfunction(L, () => {
      jsToLua(L, 0);
      return 1;
    });
    lua.lua_setfield(L, envIndex, to_luastring("safe_z"));

    lua.lua_pushjsfunction(L, () => {
      const args = luaToJs(L, 1) as Partial<Record<Xyz, number>>;
      actions.push({ type: "move", args: [args.x, args.y, args.z] });
      return 0;
    });
    lua.lua_setfield(L, envIndex, to_luastring("move"));

    lua.lua_pushjsfunction(L, () => {
      const pin = luaToJs(L, 1) as number;
      if (pin == 63) {
        const toolMounted =
          !!getDeviceAccountSettings(store.getState().resources.index)
            .body.mounted_tool_id;
        jsToLua(L, toolMounted ? 0 : 1);
        return 1;
      }
      jsToLua(L, 0);
      return 1;
    });
    lua.lua_setfield(L, envIndex, to_luastring("read_pin"));

    lua.lua_pushjsfunction(L, () => {
      const pin = luaToJs(L, 1) as number;
      const mode = luaToJs(L, 2) as number;
      const value = luaToJs(L, 3) as number;
      actions.push({ type: "write_pin", args: [pin, mode, value] });
      return 0;
    });
    lua.lua_setfield(L, envIndex, to_luastring("write_pin"));

    lua.lua_pushjsfunction(L, () => {
      const pin = luaToJs(L, 1) as number;
      actions.push({ type: "toggle_pin", args: [pin] });
      return 0;
    });
    lua.lua_setfield(L, envIndex, to_luastring("toggle_pin"));

    lua.lua_pushjsfunction(L, () => {
      const fwConfig = getFirmwareConfig(store.getState().resources.index);
      const firmwareSettings = (fwConfig as TaggedFirmwareConfig).body;
      const lengths = calculateAxialLengths({ firmwareSettings });
      jsToLua(L, lengths);
      return 1;
    });
    lua.lua_setfield(L, envIndex, to_luastring("garden_size"));

    lauxlib.luaL_loadstring(L, to_luastring(LUA_HELPERS));
    lua.lua_pushvalue(L, -2);
    lua.lua_setupvalue(L, -2, 1);
    lua.lua_pcall(L, 0, 0, 0);

    lua.lua_pushjsfunction(L, () => {
      actions.push({ type: "emergency_lock", args: [] });
      return 0;
    });
    lua.lua_setfield(L, envIndex, to_luastring("emergency_lock"));

    lua.lua_pushjsfunction(L, () => {
      actions.push({ type: "emergency_unlock", args: [] });
      return 0;
    });
    lua.lua_setfield(L, envIndex, to_luastring("emergency_unlock"));

    lua.lua_newtable(L);
    lua.lua_pushjsfunction(L, () => {
      const key = luaToJs(L, 2) as string;
      return createRecursiveNotImplemented(L, actions, [key]);
    });
    lua.lua_setfield(L, -2, to_luastring("__index"));
    lua.lua_setmetatable(L, -2);

    const statusLoad = lauxlib.luaL_loadstring(L, to_luastring(luaCode));
    if (statusLoad !== lua.LUA_OK) {
      const error = luaToJs(L, -1) as string;
      console.error("Lua load error:", error);
      return [];
    }

    lua.lua_pushvalue(L, -2);
    lua.lua_setupvalue(L, -2, 1);

    const statusCall = lua.lua_pcall(L, 0, lua.LUA_MULTRET, 0);
    if (statusCall !== lua.LUA_OK) {
      const error = luaToJs(L, -1) as string;
      console.error("Lua call error:", error);
      return [];
    }
    return actions;
  };
