import * as React from "react";
import { SpreadOverlapHelperProps } from "../../interfaces";
import { round, transformXY } from "../../util";
import { BotPosition } from "../../../../devices/interfaces";
import { cachedCrop } from "../../../../open_farm/icons";
import { isUndefined } from "lodash";

enum OverlapColor {
  NONE = "none",
  SOME = "green",
  SMALL = "yellow",
  MEDIUM = "orange",
  LARGE = "red",
}

export enum SpreadOption {
  ActivePlant = "dragged plant",
  InactivePlant = "stationary plants",
  WorseCase = "whichever results in higher % overlap",
  LesserCase = "whichever results in lower % overlap"
}

type SpreadRadii = { inactive: number, active: number };

interface SpreadCircleState {
  inactiveSpread: number | undefined;
}

export function getDiscreteColor(
  overlap: number, spreadRadius: number): OverlapColor {
  // Return overlap severity color based on discrete intervals.
  if (overlap > spreadRadius * 0.9) {
    return OverlapColor.LARGE;
  }
  if (overlap > spreadRadius * 0.6) {
    return OverlapColor.MEDIUM;
  }
  if (overlap > spreadRadius * 0.3) {
    return OverlapColor.SMALL;
  }
  if (overlap > 0) {
    return OverlapColor.SOME;
  }
  return OverlapColor.NONE;
}

export function getContinuousColor(overlap: number, spreadRadius: number) {
  // Smoothly vary color based on overlap: darkgreen > yellow > orange > red.
  if (overlap > 0) {
    const normalized = Math.round(
      Math.max(0, Math.min(spreadRadius, overlap)) / spreadRadius * 255 * 2);
    if (normalized < 255) { // green to yellow
      const r = Math.min(normalized, 255);
      const g = Math.min(100 + normalized, 255); // dark instead of bright green
      const a = Math.min(0.3, Math.round(0.5 * normalized / 510 * 100) / 100);
      return `rgba(${r}, ${g}, 0, ${a})`;
    } else { // yellow to red
      const g = Math.min(255 * 2 - normalized, 255);
      return `rgba(255, ${g}, 0, 0.3)`;
    }
  } else {
    return "none";
  }
}

export function getRadius(option: SpreadOption, data: SpreadRadii): number {
  // Get spread radius to use to evaluate overlap severity.
  switch (option) {
    case SpreadOption.ActivePlant:
      return data.active;
    case SpreadOption.InactivePlant:
      return data.inactive;
    case SpreadOption.WorseCase:
      return Math.min(data.active, data.inactive);
    case SpreadOption.LesserCase:
      return Math.max(data.active, data.inactive);
    default:
      return data.inactive;
  }
}

export function getOverlap(
  // Get the overlap of the active and inactive plant spread.
  activeXYZ: BotPosition | undefined,
  plantXYZ: BotPosition,
  spreadData: SpreadRadii
): number {
  if (activeXYZ && !isUndefined(activeXYZ.x) && !isUndefined(activeXYZ.y)
    && plantXYZ && !isUndefined(plantXYZ.x) && !isUndefined(plantXYZ.y)) {
    // Plant editing (dragging) is occuring
    const activeXY = { x: round(activeXYZ.x), y: round(activeXYZ.y) };
    const distance = Math.sqrt(
      Math.pow((activeXY.x - plantXYZ.x), 2) +
      Math.pow((activeXY.y - plantXYZ.y), 2));
    const overlap = round(Math.abs(Math.min(0,
      distance
      - getRadius(SpreadOption.InactivePlant, spreadData)
      - getRadius(SpreadOption.ActivePlant, spreadData))));
    return overlap;
  }
  return 0;
}

export function overlapText(
  qx: number,
  qy: number,
  overlap: number,
  spreadData: SpreadRadii
): JSX.Element {
  // Display spread overlap percentages for debugging purposes.
  const activeSpreadDia = spreadData.active * 2;
  const inactiveSpreadDia = spreadData.inactive * 2;
  const percentage = (spread: number) =>
    round(Math.min(100, Math.min(Math.min(activeSpreadDia, inactiveSpreadDia),
      overlap) / spread * 100));
  if (overlap > 0) {
    return <g id="overlap-values">
      <text x={qx} y={qy} dy={-75}>
        {"Active: " + percentage(activeSpreadDia) + "%"}
      </text>
      <text x={qx} y={qy} dy={-50}>
        {"Inactive: " + percentage(inactiveSpreadDia) + "%"}
      </text>
      <text x={qx} y={qy} dy={25}>
        {getDiscreteColor(
          overlap, getRadius(SpreadOption.InactivePlant, spreadData))}
      </text>
    </g>;
  } else {
    return <g />;
  }
}

export class SpreadOverlapHelper extends
  React.Component<SpreadOverlapHelperProps, SpreadCircleState> {
  state: SpreadCircleState = { inactiveSpread: undefined };

  componentDidMount() {
    cachedCrop(this.props.plant.body.openfarm_slug)
      .then(({ spread }) =>
        this.setState({ inactiveSpread: (spread || 0) * 10 }));
  }

  render() {
    const { dragging, plant, activeDragXY, activeDragSpread,
      mapTransformProps } = this.props;
    const { radius, x, y } = plant.body;
    const { qx, qy } = transformXY(round(x), round(y), mapTransformProps);
    const gardenCoord: BotPosition = { x: round(x), y: round(y), z: 0 };

    // Convert spread diameter to radius (in mm).
    const spreadRadii = {
      active: (activeDragSpread || 0) / 2,
      // `radius * 10` is the default value for spread diameter (in mm).
      inactive: (this.state.inactiveSpread || (radius * 10)) / 2
    };

    const overlapValue = getOverlap(activeDragXY, gardenCoord, spreadRadii);
    // Overlap is evaluated against the inactive plant since evaluating
    // against the active plant would require keeping a list of all plants
    // overlapping the active plant. Therefore, the spread overlap helper
    // should be thought of as a tool checking the inactive plants, not
    // the plant being edited. Dragging a plant with a small spread into
    // the area of a plant with large spread will illustrate this point.
    const color = getContinuousColor(
      overlapValue, getRadius(SpreadOption.InactivePlant, spreadRadii));
    const debug = false; // change to true to show % overlap values

    return <g id="overlap-indicator">
      {!dragging && // Non-active plants
        <circle
          className="overlap-circle"
          cx={qx}
          cy={qy}
          r={spreadRadii.inactive * 0.95}
          fill={color} />}
      {debug && !dragging &&
        overlapText(qx, qy, overlapValue, spreadRadii)}
    </g>;
  }
}
