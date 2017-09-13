import * as React from "react";
import { SpreadOverlapHelperProps } from "./interfaces";
import { round, getXYFromQuadrant } from "./util";
import { isUndefined } from "util";
import { BotPosition } from "../../devices/interfaces";
import { cachedCrop } from "../../open_farm/index";

enum Overlap {
  NONE = "none",
  SOME = "green",
  SMALL = "yellow",
  MEDIUM = "orange",
  LARGE = "red",
}

type OverlapData = {
  color: Overlap,
  value: number
};

interface SpreadCircleState {
  inactiveSpread: number | undefined;
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
    function evaluateOverlap(overlap: number, spreadRadius: number): OverlapData {
      if (overlap > spreadRadius * 0.9) {
        return { color: Overlap.LARGE, value: overlap };
      }
      if (overlap > spreadRadius * 0.6) {
        return { color: Overlap.MEDIUM, value: overlap };
      }
      if (overlap > spreadRadius * 0.3) {
        return { color: Overlap.SMALL, value: overlap };
      }
      if (overlap > 0) {
        return { color: Overlap.SOME, value: overlap };
      }
      return { color: Overlap.NONE, value: overlap };
    }

    function getOverlap
      (activeXYZ: BotPosition | undefined, plantXYZ: BotPosition): OverlapData {
      if (activeXYZ && !isUndefined(activeXYZ.x) && !isUndefined(activeXYZ.y)
        && plantXYZ && !isUndefined(plantXYZ.x) && !isUndefined(plantXYZ.y)) {
        // Plant editing (dragging) is occuring
        const activeXY = { x: round(activeXYZ.x), y: round(activeXYZ.y) };
        const distance = Math.sqrt(
          Math.pow((activeXY.x - plantXYZ.x), 2) +
          Math.pow((activeXY.y - plantXYZ.y), 2));
        const overlap = round(Math.abs(
          Math.min(0, distance - inactiveSpreadRadius - activeSpreadRadius)));

        // Overlap is evaluated against the inactive plant since evaluating
        // against the active plant would require keeping a list of all plants
        // overlapping the active plant. Therefore, the spread overlap helper
        // should be thought of as a tool checking the inactive plants, not
        // the plant being edited. Dragging a plant with a small spread into
        // the area of a plant with large spread will illustrate this point.
        return evaluateOverlap(overlap, inactiveSpreadRadius);
      }
      return { color: Overlap.NONE, value: 0 };
    }

    function overlapValues() {
      // Display spread overlap percentages for debugging purposes
      const activeSpread = activeSpreadRadius * 2;
      const inactiveSpread = inactiveSpreadRadius * 2;
      const percentage = (spread: number) =>
        round(Math.min(100, Math.min(Math.min(activeSpread, inactiveSpread),
          overlapData.value) / spread * 100));
      if (overlapData.value > 0) {
        return <g id="overlap-values">
          <text x={qx} y={qy} dy={-75}>
            {"Active: " + percentage(activeSpread) + "%"}
          </text>
          <text x={qx} y={qy} dy={-50}>
            {"Inactive: " + percentage(inactiveSpread) + "%"}
          </text>
          <text x={qx} y={qy} dy={25}>
            {overlapData.color}
          </text>
        </g>;
      } else {
        return <g />;
      }
    }

    const { dragging, plant, activeDragXY, activeDragSpread, mapTransformProps } = this.props;
    const { quadrant, gridSize } = mapTransformProps;
    const { radius, x, y } = plant.body;
    const { qx, qy } = getXYFromQuadrant(round(x), round(y), quadrant, gridSize);
    const gardenCoord: BotPosition = { x: round(x), y: round(y), z: 0 };

    // Convert `spread` from diameter in cm to radius in mm.
    // `radius * 10` is the default value for spread.
    const activeSpreadRadius = (activeDragSpread || radius * 10) / 2;
    const inactiveSpreadRadius = (this.state.inactiveSpread || radius * 10) / 2;

    const overlapData = getOverlap(activeDragXY, gardenCoord);
    const debug = false; // change to true to show % overlap values

    function getColor() {
      // Smoothly vary color based on overlap from dark green > yellow > orange > red
      if (overlapData.value > 0) {
        const normalized = Math.round(
          Math.max(0, Math.min(inactiveSpreadRadius, overlapData.value))
          / (inactiveSpreadRadius) * 255 * 2);
        if (normalized < 255) { // green to yellow
          const r = Math.min(normalized, 255);
          const g = Math.min(100 + normalized, 255); // dark instead of bright green
          return `rgb(${r}, ${g}, 0)`;
        } else { // yellow to red
          const g = Math.min(255 * 2 - normalized, 255);
          return `rgb(255, ${g}, 0)`;
        }
      } else {
        return "none";
      }
    }

    return <g id="overlap-circle">
      {!dragging && // Non-active plants
        <circle
          className="overlap-circle"
          cx={qx}
          cy={qy}
          r={inactiveSpreadRadius * 0.95}
          fill={getColor()}

          fillOpacity={0.3} />}
      {debug && !dragging &&
        overlapValues()}
    </g>;
  }
}
