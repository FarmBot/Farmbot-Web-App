import {
  ALLOWED_GROUPING,
  ALLOWED_ROUTE,
  Identifier,
  MoveBodyItem,
  ParameterApplication,
  Xyz,
} from "farmbot";
import { store } from "../../redux/store";
import { XyzNumber } from "./interfaces";
import {
  maybeFindPointById,
  maybeFindSlotByToolId,
} from "../../resources/selectors";
import { getDefaultAxisOrder, getSafeZ, getSoilHeight } from "./stubs";
import { clone } from "lodash";

export const addDefaults = (body: MoveBodyItem[]): MoveBodyItem[] => {
  if (body.some(item => item.kind === "axis_order")) {
    return body;
  }
  return body.concat(getDefaultAxisOrder());
};

export const calculateMove = (
  body: MoveBodyItem[] | undefined,
  current: XyzNumber,
  variables: ParameterApplication[] | undefined,
): { moves: XyzNumber[], warnings: string[] } => {
  const pos = clone(current);
  const warnings: string[] = [];
  const moveBodyItems = addDefaults(body || []);
  // eslint-disable-next-line complexity
  moveBodyItems.map(item => {
    switch (item.kind) {
      case "axis_addition":
        switch (item.args.axis_operand.kind) {
          case "numeric":
            if (item.args.axis == "all") {
              pos.x += item.args.axis_operand.args.number;
              pos.y += item.args.axis_operand.args.number;
              pos.z += item.args.axis_operand.args.number;
            } else {
              pos[item.args.axis] += item.args.axis_operand.args.number;
            }
            break;
          case "coordinate":
            if (item.args.axis == "all") {
              pos.x += item.args.axis_operand.args.x;
              pos.y += item.args.axis_operand.args.y;
              pos.z += item.args.axis_operand.args.z;
            } else {
              pos[item.args.axis] += item.args.axis_operand.args[item.args.axis];
            }
            break;
          default:
            warnings.push(
              `axis_addition axis_operand kind: ${item.args.axis_operand.kind}`);
            break;
        }
        return;
      case "axis_overwrite":
        switch (item.args.axis_operand.kind) {
          case "numeric":
            if (item.args.axis == "all") {
              pos.x = item.args.axis_operand.args.number;
              pos.y = item.args.axis_operand.args.number;
              pos.z = item.args.axis_operand.args.number;
            } else {
              pos[item.args.axis] = item.args.axis_operand.args.number;
            }
            break;
          case "coordinate":
            if (item.args.axis == "all") {
              pos.x = item.args.axis_operand.args.x;
              pos.y = item.args.axis_operand.args.y;
              pos.z = item.args.axis_operand.args.z;
            } else {
              pos[item.args.axis] = item.args.axis_operand.args[item.args.axis];
            }
            break;
          case "tool":
            const toolSlot = maybeFindSlotByToolId(
              store.getState().resources.index,
              item.args.axis_operand.args.tool_id);
            if (!toolSlot) {
              break;
            }
            const toolSlotBody = clone(toolSlot.body);
            if (toolSlotBody.gantry_mounted) { toolSlotBody.x = pos.x; }
            if (item.args.axis == "all") {
              pos.x = toolSlotBody.x;
              pos.y = toolSlotBody.y;
              pos.z = toolSlotBody.z;
            } else {
              pos[item.args.axis] = toolSlotBody[item.args.axis];
            }
            break;
          case "point":
            const point = maybeFindPointById(
              store.getState().resources.index,
              item.args.axis_operand.args.pointer_id);
            if (!point) { break; }
            if (item.args.axis == "all") {
              pos.x = point.body.x;
              pos.y = point.body.y;
              pos.z = point.body.z;
            } else {
              pos[item.args.axis] = point.body[item.args.axis];
            }
            break;
          case "identifier":
            const location = (variables || []).filter(v => {
              const identifier = item.args.axis_operand as Identifier;
              return v.args.label == identifier.args.label;
            })
              .map(v => v.args.data_value)[0];
            if (location?.kind == "coordinate") {
              pos.x = location.args.x;
              pos.y = location.args.y;
              pos.z = location.args.z;
            } else if (location?.kind == "point") {
              const point = maybeFindPointById(
                store.getState().resources.index,
                location.args.pointer_id);
              if (!point) { break; }
              pos.x = point.body.x;
              pos.y = point.body.y;
              pos.z = point.body.z;
            } else {
              warnings.push(`identifier location kind: ${location?.kind}`);
            }
            break;
          case "special_value":
            if (item.args.axis_operand.args.label == "soil_height"
              && item.args.axis == "z") {
              pos.z = getSoilHeight(pos.x, pos.y);
            } else if (item.args.axis_operand.args.label == "safe_height"
              && item.args.axis == "z") {
              pos.z = getSafeZ();
            } else {
              warnings.push(
                `special_value label: ${item.args.axis_operand.args.label}`);
            }
            break;
          default:
            warnings.push(
              `axis_overwrite axis_operand kind: ${item.args.axis_operand.kind}`);
            break;
        }
        return;
      case "speed_overwrite":
        return;
      case "safe_z":
        return;
      case "axis_order":
        return;
      default:
        warnings.push(`item kind: ${(item as MoveBodyItem).kind}`);
        return;
    }
  });
  if (moveBodyItems.some(item => item.kind === "safe_z")) {
    const safeZ = getSafeZ();
    return {
      moves: [
        { x: current.x, y: current.y, z: safeZ },
        { x: pos.x, y: pos.y, z: safeZ },
        pos,
      ],
      warnings,
    };
  }
  const axisOrderItems = moveBodyItems.filter(item => item.kind === "axis_order");
  if (axisOrderItems.length > 0) {
    const { grouping, route } = axisOrderItems[0].args;
    const moves = generateMoves(grouping, route, current, pos);
    return { moves, warnings };
  }
  return { moves: [pos], warnings };
};

const generateMoves = (
  grouping: ALLOWED_GROUPING,
  route: ALLOWED_ROUTE,
  current: XyzNumber,
  target: XyzNumber,
) => {
  const axes: Xyz[] = ["x", "y", "z"];
  const zGoingUp = Math.abs(target.z) < Math.abs(current.z);
  const groupsInput: string[] = grouping.split(",");
  const isZFirst = (groups: string[]): boolean =>
    !groups.join("").includes("z") || groups[0].includes("z");
  const zFirst = (groupsArg: string[]): string[] => {
    const groups = clone(groupsArg);
    const idx = groups.findIndex(s => s.includes("z"));
    if (idx > 0) {
      const [group] = groups.splice(idx, 1);
      groups.unshift(group);
    }
    return groups;
  };
  const reverse = (groupsArg: string[]): string[] => clone(groupsArg).reverse();
  const isOrderOk = (groups: string[]): boolean => {
    switch (route) {
      case "high":
        return isZFirst(zGoingUp ? groups : reverse(groups));
      case "low":
        return isZFirst(zGoingUp ? reverse(groups) : groups);
      default:
        return true;
    }
  };
  const reorder = (groups: string[]): string[] => {
    if (isOrderOk(groups)) { return groups; }
    if (isOrderOk(reverse(groups))) { return reverse(groups); }
    if (isOrderOk(zFirst(groups))) { return zFirst(groups); }
    return reverse(zFirst(groups));
  };
  const moves: XyzNumber[] = [];
  let lastState = { ...current };
  reorder(groupsInput).map(group => {
    const normalized = group.split("").sort().join("");
    const movement = { ...lastState };
    axes.map(axis => {
      if (normalized.includes(axis)) {
        movement[axis] = target[axis];
      }
    });
    moves.push(movement);
    lastState = movement;
  });
  return moves;
};
