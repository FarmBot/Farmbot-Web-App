import * as React from "react";
import { GardenPlantProps, GardenPlantState } from "../interfaces";
import { cachedCrop, DEFAULT_ICON, svgToUrl } from "../../open_farm/index";
import { Circle } from "./circle";
import { round, getXYFromQuadrant } from "./util";
import { isUndefined } from "util";

const GRAY = "#434343";
const RED = "#ee6666";

export class GardenPlant extends
  React.Component<GardenPlantProps, Partial<GardenPlantState>> {

  state: GardenPlantState = { icon: DEFAULT_ICON };

  componentDidMount() {
    const OFS = this.props.plant.body.openfarm_slug;
    cachedCrop(OFS)
      .then(({ svg_icon }) => {
        this.setState({ icon: svgToUrl(svg_icon) });
      });
  }

  render() {
    const { selected, dragging, plant, onClick, dispatch,
      quadrant, zoomLvl, activeDragXY } = this.props;
    const { radius, x, y } = plant.body;
    const { icon } = this.state;

    const scale = 1 + Math.round(15 * (1.8 - zoomLvl)) / 10; // scale factor

    const action = { type: "TOGGLE_HOVERED_PLANT", payload: { plant, icon } };
    const { qx, qy } = getXYFromQuadrant(round(x), round(y), quadrant);
    const gardenCoord = getXYFromQuadrant(qx, qy, quadrant);

    let horizAlign = false;
    let vertAlign = false;
    const alpha = dragging ? 0.4 : 1.0;
    if (activeDragXY && !isUndefined(activeDragXY.x) && !isUndefined(activeDragXY.y)) {
      // Plant editing (dragging) is occuring
      const activeXY = { qx: round(activeDragXY.x), qy: round(activeDragXY.y) };
      if (activeXY.qx == gardenCoord.qx) {
        // The plant is aligned vertically with the dragged plant
        vertAlign = true;
      }
      if (activeXY.qy == gardenCoord.qy) {
        // The plant is aligned horizontally with the dragged plant
        horizAlign = true;
      }
    }

    return <g>
      <Circle
        className="plant-indicator"
        x={qx}
        y={qy}
        r={radius}
        selected={selected} />

      <image
        className={"plant-image is-chosen-" + selected}
        opacity={alpha}
        xlinkHref={this.state.icon}
        onClick={() => onClick(this.props.plant)}
        onMouseEnter={() => dispatch(action)}
        onMouseLeave={() => dispatch(action)}
        height={radius * 2}
        width={radius * 2}
        x={qx - radius}
        y={qy - radius} />
      {dragging &&
        <text id="coordinates-tooltip"
          x={qx} y={qy} dy={-20 * scale} fontSize={1.25 * scale + "rem"} style={{ fill: GRAY }}>
          {gardenCoord.qx}, {gardenCoord.qy}
        </text>}
      {dragging &&
        <g id="long-crosshair">
          <rect x={qx - 0.5} y={0} width={1} height={1500} style={{ fill: GRAY }} />
          <rect x={0} y={qy - 0.5} width={3000} height={1} style={{ fill: GRAY }} />
        </g>}
      {dragging &&
        <g id="short-crosshair">
          <rect x={qx - 10 * scale} y={qy - 1 * scale}
            width={8 * scale} height={2 * scale} style={{ fill: GRAY }} />
          <rect x={qx - 1 * scale} y={qy - 10 * scale}
            width={2 * scale} height={8 * scale} style={{ fill: GRAY }} />
          <rect x={qx + 2 * scale} y={qy - 1 * scale}
            width={8 * scale} height={2 * scale} style={{ fill: GRAY }} />
          <rect x={qx - 1 * scale} y={qy + 2 * scale}
            width={2 * scale} height={8 * scale} style={{ fill: GRAY }} />
        </g>}
      {!dragging && horizAlign &&
        <g id="horiz-alignment-indicator">
          <rect x={qx - radius - 10 * scale} y={qy - 1 * scale}
            width={8 * scale} height={2 * scale} style={{ fill: RED }} />
          <rect x={qx + radius + 2 * scale} y={qy - 1 * scale}
            width={8 * scale} height={2 * scale} style={{ fill: RED }} />
        </g>}
      {!dragging && vertAlign &&
        <g id="vert-alignment-indicator">
          <rect x={qx - 1 * scale} y={qy - radius - 10 * scale}
            width={2 * scale} height={8 * scale} style={{ fill: RED }} />
          <rect x={qx - 1 * scale} y={qy + radius + 2 * scale}
            width={2 * scale} height={8 * scale} style={{ fill: RED }} />
        </g>}
    </g >;
  }
}
