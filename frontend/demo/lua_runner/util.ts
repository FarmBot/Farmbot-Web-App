import { lua, to_jsstring, to_luastring } from "fengari-web";
import { Action } from "./interfaces";
import { RpcRequestBodyItem } from "farmbot";

export const createRecursiveNotImplemented = (
  L: unknown,
  actions: Action[],
  path: string[],
) => {
  lua.lua_newtable(L);
  lua.lua_newtable(L);
  lua.lua_pushjsfunction(L, () => {
    const key = luaToJs(L, 2) as string;
    return createRecursiveNotImplemented(L, actions, [...path, key]);
  });
  lua.lua_setfield(L, -2, to_luastring("__index"));

  lua.lua_pushjsfunction(L, () => {
    const fullPath = path.join(".");
    actions.push({
      type: "send_message",
      args: [
        "error",
        `Lua function "${fullPath}" is not implemented.`,
        "toast",
      ],
    });
    jsToLua(L, false);
    return 1;
  });
  lua.lua_setfield(L, -2, to_luastring("__call"));

  lua.lua_setmetatable(L, -2);
  return 1;
};

export const luaToJs = (L: unknown, idx: number): unknown => {
  const type = lua.lua_type(L, idx);
  switch (type) {
    case lua.LUA_TNIL:
      return undefined;
    case lua.LUA_TBOOLEAN:
      return lua.lua_toboolean(L, idx);
    case lua.LUA_TNUMBER:
      return lua.lua_tonumber(L, idx);
    case lua.LUA_TSTRING:
      return to_jsstring(lua.lua_tostring(L, idx));
    case lua.LUA_TTABLE:
      return luaTableToJs(L, idx);
    default:
      return `<${to_jsstring(lua.lua_typename(L, type))}>`;
  }
};

const luaTableToJs = (L: unknown, idx: number): unknown => {
  const absIndex = lua.lua_absindex(L, idx);
  const keyVals: [string | number, unknown][] = [];

  lua.lua_pushnil(L);
  while (lua.lua_next(L, absIndex)) {
    const key = luaToJs(L, -2) as (string | number);
    const val = luaToJs(L, -1);
    keyVals.push([key, val]);
    lua.lua_pop(L, 1);
  }
  const isSequentialArray =
    keyVals.every(([k], i) => typeof k === "number" && k === i + 1);
  if (isSequentialArray) {
    return keyVals.map(([, v]) => v);
  } else {
    const result: Record<string, unknown> = {};
    for (const [key, value] of keyVals) {
      result["" + key] = value;
    }
    return result;
  }
};

export const jsToLua = (L: unknown, value: unknown): void => {
  if (value === undefined) {
    lua.lua_pushnil(L);
  } else if (typeof value === "boolean") {
    lua.lua_pushboolean(L, value);
  } else if (typeof value === "number") {
    lua.lua_pushnumber(L, value);
  } else if (typeof value === "string") {
    lua.lua_pushstring(L, to_luastring(value));
  } else if (Array.isArray(value)) {
    lua.lua_newtable(L);
    for (let i = 0; i < value.length; i++) {
      jsToLua(L, value[i]);
      lua.lua_rawseti(L, -2, i + 1);
    }
  } else if (typeof value === "object") {
    lua.lua_newtable(L);
    for (const key in value) {
      jsToLua(L, (value as Record<string, unknown>)[key]);
      lua.lua_setfield(L, -2, to_luastring(key));
    }
  } else {
    jsToLua(L, `<${typeof value}>`);
  }
};

// eslint-disable-next-line complexity
export const csToLua = (command: RpcRequestBodyItem): string => {
  const { kind, args, body } = command;
  switch (kind) {
    case "emergency_lock":
      return "emergency_lock()";
    case "emergency_unlock":
      return "emergency_unlock()";
    case "find_home":
      return `find_home("${args.axis}")`;
    case "home":
      return `go_to_home("${args.axis}")`;
    case "wait":
      return `wait(${args.milliseconds})`;
    case "send_message":
      return `send_message("${args.message_type}", "${args.message}")`;
    case "move_relative":
      return `move_relative(${args.x}, ${args.y}, ${args.z})`;
    case "move_absolute":
      const lKind = args.location.kind;
      if (lKind == "coordinate") {
        const cArgs = args.location.args;
        return `move_absolute(${cArgs.x}, ${cArgs.y}, ${cArgs.z})`;
      }
      return `toast("move_absolute ${lKind} is not implemented", "error")`;
    case "move":
      const values = (body || [])
        .filter(part => part.kind == "axis_overwrite")
        .map(axisOverwrite => {
          const { axis, axis_operand } = axisOverwrite.args;
          if (axis == "all") {
            if (axis_operand.kind == "coordinate") {
              const { args } = axis_operand;
              return `x=${args.x}, y=${args.y}, z=${args.z}`;
            }
          } else {
            if (axis_operand.kind == "numeric") {
              return `${axis}=${axis_operand.args.number}`;
            }
            if (axis_operand.kind == "coordinate") {
              return `${axis}=${axis_operand.args[axis]}`;
            }
          }
        })
        .join(", ");
      return `move{${values}}`;
    case "write_pin":
      const mode = args.pin_mode ? "analog" : "digital";
      return `write_pin(${args.pin_number}, "${mode}", ${args.pin_value})`;
    case "toggle_pin":
      return `toggle_pin(${args.pin_number})`;
    case "lua":
      return args.lua;
    default:
      return `toast("celeryscript ${kind} is not implemented", "error")`;
  }
};
