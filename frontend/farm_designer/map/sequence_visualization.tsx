import React from "react";
import { Actions } from "../../constants";
import { UUID } from "../../resources/interfaces";
import {
  SequenceBodyItem, LegalSequenceKind,
  MoveAbsolute, Home, FindHome, Calibrate, Zero,
} from "farmbot";
import { MapTransformProps } from "./interfaces";
import { transformXY } from "./util";
import { Color } from "../../ui";
import { BotPosition } from "../../devices/interfaces";
import { zoomCompensation } from "./zoom";
import {
  findPointerByTypeAndId, findSlotByToolId,
} from "../../resources/selectors";
import { store } from "../../redux/store";
import { findVariableByName } from "../../resources/sequence_meta";
import { getStepTag } from "../../resources/sequence_tagging";
import {
  computeCoordinate,
} from "../../sequences/step_tiles/tile_computed_move/compute";
import { FilePath, Icon, Path } from "../../internal_urls";

const ICON_LOOKUP: Partial<Record<LegalSequenceKind, Icon>> = {
  // _if: Icon.settings,
  // assertion: Icon.settings,
  // calibrate: Icon.settings,
  change_ownership: Icon.settings,
  check_updates: Icon.settings,
  // emergency_lock: Icon.settings,
  // emergency_unlock: Icon.settings,
  // execute: Icon.settings,
  execute_script: Icon.farmware,
  factory_reset: Icon.settings,
  // find_home: Icon.settings,
  flash_firmware: Icon.settings,
  // home: Icon.settings,
  install_farmware: Icon.farmware,
  install_first_party_farmware: Icon.farmware,
  move: Icon.controls,
  move_absolute: Icon.controls,
  // move_relative: Icon.settings,
  power_off: Icon.settings,
  read_pin: Icon.sensors,
  read_status: Icon.settings,
  reboot: Icon.settings,
  remove_farmware: Icon.farmware,
  // send_message: Icon.settings,
  // set_servo_angle: Icon.settings,
  set_user_env: Icon.settings,
  sync: Icon.settings,
  take_photo: Icon.photos,
  // toggle_pin: Icon.settings,
  update_farmware: Icon.farmware,
  update_resource: Icon.settings,
  wait: Icon.calendar,
  // write_pin: Icon.settings,
  // zero: Icon.settings,

};
type Position = { x: number, y: number, icon?: Icon, uuid?: string };

export const visualizeInMap = (sequenceUuid: UUID | undefined) => ({
  type: Actions.VISUALIZE_SEQUENCE,
  payload: sequenceUuid,
});

export interface SequenceVisualizationProps {
  visualizedSequenceUUID: UUID | undefined;
  visualizedSequenceBody: SequenceBodyItem[];
  hoveredSequenceStep: string | undefined;
  mapTransformProps: MapTransformProps;
  botPosition: BotPosition;
  zoomLvl: number;
  dispatch: Function;
}

/**
 * Sequence visualizer.
 *
 * Display a visualization of Sequence step movements and actions in the map.
 * Can be toggled on/off and updates in realtime when sequence steps are
 * modified or the current bot position is changed. Hover a step to view the
 * corresponding visual or vice versa.
 *
 * | movement  | icon  | other | Sequence step
 * |-----------|-------|-------|---------------
 * |           |       |   x   | _if
 * |           |       |   x   | assertion
 * |     x     |       |       | calibrate
 * |           |   x   |       | change_ownership
 * |           |   x   |       | check_updates
 * |           |   _   |       | emergency_lock
 * |           |   _   |       | emergency_unlock
 * |           |       |   x   | execute
 * |           |   x   |       | execute_script
 * |           |   x   |       | factory_reset
 * |     x     |       |       | find_home
 * |           |   x   |       | flash_firmware
 * |     x     |       |       | home
 * |           |   x   |       | install_farmware
 * |           |   x   |       | install_first_party_farmware
 * |     x     |   x   |       | move
 * |     x     |   x   |       | move_absolute
 * |     x     |       |       | move_relative
 * |           |   x   |       | power_off
 * |           |   x   |       | read_pin
 * |           |   x   |       | read_status
 * |           |   x   |       | reboot
 * |           |   x   |       | remove_farmware
 * |           |   _   |       | send_message
 * |           |   _   |       | set_servo_angle
 * |           |   x   |       | set_user_env
 * |           |   x   |       | sync
 * |           |   x   |       | take_photo
 * |           |   _   |       | toggle_pin
 * |           |   x   |       | update_farmware
 * |           |   x   |       | update_resource
 * |           |   x   |       | wait
 * |           |   _   |       | write_pin
 * |     x     |       |       | zero
 *
 * Options:
 *  * Guided step-through with sensor value input and pin state display
 *  * Non-default external variable support
 */
export const SequenceVisualization = (props: SequenceVisualizationProps) => {
  const { visualizedSequenceBody, botPosition, visualizedSequenceUUID } = props;
  const positions = preparePositions(
    visualizedSequenceBody, botPosition, visualizedSequenceUUID);
  const travels = preparePositionPairs(positions);
  const { mapTransformProps, zoomLvl, hoveredSequenceStep, dispatch } = props;
  const commonProps = {
    mapTransformProps, zoomLvl, hoveredSequenceStep, dispatch
  };
  const point = addLocation(commonProps);
  const line = addLine(commonProps);
  const icon = addIcon(commonProps);
  return <g id={"visualized-sequence"}>
    {travels.map(({ start, end }, index) =>
      <g id={`segment-${index}`} key={index}>
        {line(start, end)}
        {point(end)}
        {icon(start)}
        {icon(end)}
      </g>)}
  </g>;
};

export const hoverSequenceStep =
  (uuid: string | undefined) => (dispatch: Function) => () => Path.inDesigner() &&
    dispatch({
      type: Actions.HOVER_SEQUENCE_STEP,
      payload: uuid,
    });

interface AddSVGElementProps {
  mapTransformProps: MapTransformProps;
  zoomLvl: number;
  hoveredSequenceStep: string | undefined;
  dispatch: Function;
}

const addLocation = (props: AddSVGElementProps) =>
  (location: Position) => {
    const { x, y } = location;
    const { qx, qy } = transformXY(x, y, props.mapTransformProps);
    const { hoveredSequenceStep } = props;
    const hovered = hoveredSequenceStep && hoveredSequenceStep == location.uuid;
    return <circle
      onMouseEnter={props.dispatch(hoverSequenceStep(location.uuid))}
      onMouseLeave={props.dispatch(hoverSequenceStep(undefined))}
      cx={qx} cy={qy}
      r={zoomCompensation(props.zoomLvl, 10)}
      fill={Color.darkOrange}
      fillOpacity={hovered ? 1 : 0.5} />;
  };

const addLine = (props: AddSVGElementProps) =>
  (start: Position, end: Position) => {
    const { mapTransformProps, zoomLvl } = props;
    const transformedStart = transformXY(start.x, start.y, mapTransformProps);
    const transformedEnd = transformXY(end.x, end.y, mapTransformProps);
    const { hoveredSequenceStep } = props;
    const hovered = hoveredSequenceStep && hoveredSequenceStep == end.uuid;
    return <line
      onMouseEnter={props.dispatch(hoverSequenceStep(end.uuid))}
      onMouseLeave={props.dispatch(hoverSequenceStep(undefined))}
      x1={transformedStart.qx} y1={transformedStart.qy}
      x2={transformedEnd.qx} y2={transformedEnd.qy}
      stroke={Color.darkOrange}
      strokeWidth={zoomCompensation(zoomLvl, hovered ? 8 : 5)}
      strokeOpacity={hovered ? 1 : 0.5} />;
  };

const addIcon = (props: AddSVGElementProps) =>
  (location: Position) => {
    const { x, y } = location;
    const { qx, qy } = transformXY(x, y, props.mapTransformProps);
    const size = zoomCompensation(props.zoomLvl, 25);
    const { hoveredSequenceStep } = props;
    const hovered = hoveredSequenceStep && hoveredSequenceStep == location.uuid;
    return location.icon
      ? <image
        onMouseEnter={props.dispatch(hoverSequenceStep(location.uuid))}
        onMouseLeave={props.dispatch(hoverSequenceStep(undefined))}
        x={qx - size / 2} y={qy - size / 2}
        width={size} height={size}
        xlinkHref={FilePath.icon(location.icon)}
        opacity={hovered ? 1 : 0.5} />
      : <g />;
  };

/** Generate a list of positions dictated by Sequence body steps. */
const preparePositions = (
  sequenceBody: SequenceBodyItem[],
  initialPosition: BotPosition,
  sequenceUuid: UUID | undefined,
) => {
  const positions: Position[] = [];
  positions.push({
    x: initialPosition.x || 0,
    y: initialPosition.y || 0,
  });
  sequenceBody.map(step => {
    const previous = positions[positions.length - 1];
    switch (step.kind) {
      case "move":
        const moveCoordinate = computeCoordinate({
          step,
          botPosition: { x: previous.x, y: previous.y, z: undefined },
          resourceIndex: store.getState().resources.index,
          sequenceUuid,
        });
        positions.push(moveCoordinate);
        break;
      case "move_absolute":
        const moveAbsoluteCoordinate = reduceMoveAbsolute(step, sequenceUuid);
        if (moveAbsoluteCoordinate) { positions.push(moveAbsoluteCoordinate); }
        break;
      case "move_relative":
        const relative = step.args;
        positions.push({
          x: previous.x + relative.x,
          y: previous.y + relative.y,
        });
        break;
      case "home":
      case "find_home":
      case "zero":
      case "calibrate":
        const homingCoordinate = reduceHomingStep(step, previous);
        if (homingCoordinate) { positions.push(homingCoordinate); }
        break;
    }
    positions[positions.length - 1].icon = ICON_LOOKUP[step.kind];
    positions[positions.length - 1].uuid = getStepTag(step);
  });
  return positions;
};

const reduceMoveAbsolute = (
  step: MoveAbsolute,
  sequenceUuid: UUID | undefined,
): Position | undefined => {
  const offset = step.args.offset.args;
  const ri = store.getState().resources.index;
  switch (step.args.location.kind) {
    case "coordinate":
      const coordinate = step.args.location.args;
      return {
        x: coordinate.x + offset.x,
        y: coordinate.y + offset.y,
      };
    case "point":
      const { pointer_id } = step.args.location.args;
      const point = findPointerByTypeAndId(ri, "Point", pointer_id);
      return {
        x: point.body.x + offset.x,
        y: point.body.y + offset.y,
      };
    case "tool":
      const { tool_id } = step.args.location.args;
      const toolSlot = findSlotByToolId(ri, tool_id);
      if (!toolSlot) { return; }
      return {
        x: toolSlot.body.x + offset.x,
        y: toolSlot.body.y + offset.y,
      };
    case "identifier":
      const { label } = step.args.location.args;
      if (!sequenceUuid) { return; }
      const variable = findVariableByName(ri, sequenceUuid, label);
      if (!(variable && variable.vector)) { return; }
      return {
        x: variable.vector.x + offset.x,
        y: variable.vector.y + offset.y,
      };
  }
};

const reduceHomingStep = (
  step: Home | FindHome | Calibrate | Zero,
  prevPosition: Position,
): Position | undefined => {
  switch (step.args.axis) {
    case "x":
      return { x: 0, y: prevPosition.y };
    case "y":
      return { x: prevPosition.x, y: 0 };
    case "all":
      return { x: 0, y: 0 };
  }
};

/** Group a list of positions into position pairs. */
const preparePositionPairs = (positions: Position[]) => {
  const pairs:
    { start: Position, end: Position }[] =
    [];
  positions.map((position, index) => {
    if (index > 0) {
      const previous = positions[index - 1];
      pairs.push({ start: previous, end: position });
    }
  });
  return pairs;
};
