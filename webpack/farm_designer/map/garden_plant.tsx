import * as React from "react";
import { GardenPlantProps, GardenPlantState } from "../interfaces";
import { cachedCrop, DEFAULT_ICON, svgToUrl } from "../../open_farm/index";
import { Circle } from "./circle";
import { round, getXYFromQuadrant } from "./util";

export class GardenPlant extends
  React.Component<GardenPlantProps, Partial<GardenPlantState>> {

  state: GardenPlantState = { icon: DEFAULT_ICON };

  componentDidMount() {
    let OFS = this.props.plant.body.openfarm_slug;
    cachedCrop(OFS)
      .then(({ svg_icon }) => {
        this.setState({ icon: svgToUrl(svg_icon) });
      });
  }

  render() {
    let { selected, dragging, plant, onClick, dispatch, quadrant, zoomLvl } = this.props;
    let { radius, x, y } = plant.body;
    let { icon } = this.state;

    let scale = 1 + Math.round(15 * (1.8 - zoomLvl)) / 10; // scale factor
    let alpha = dragging ? 0.4 : 1.0;

    let action = { type: "TOGGLE_HOVERED_PLANT", payload: { plant, icon } };
    let { qx, qy } = getXYFromQuadrant(round(x), round(y), quadrant);

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
      {dragging && // coordinates tooltip
        <text x={qx} y={qy} dy={-20 * scale} fontSize={1.25 * scale + "rem"}>
          {qx}, {qy}
        </text>}
      {dragging && // crosshair
        <g>
          <rect x={qx - 10 * scale} y={qy - 1 * scale} width={8 * scale} height={2 * scale} />
          <rect x={qx - 1 * scale} y={qy - 10 * scale} width={2 * scale} height={8 * scale} />
          <rect x={qx + 2 * scale} y={qy - 1 * scale} width={8 * scale} height={2 * scale} />
          <rect x={qx - 1 * scale} y={qy + 2 * scale} width={2 * scale} height={8 * scale} />
        </g>}
    </g >;
  }
}
