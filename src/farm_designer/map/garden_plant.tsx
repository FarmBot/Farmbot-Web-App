import * as React from "react";
import { GardenPlantProps, GardenPlantState } from "../interfaces";
import { cachedIcon, DEFAULT_ICON, svgToUrl } from "../../open_farm/index";
import { Circle } from "./circle";
import { round, getXYFromQuadrant } from "./util";

export class GardenPlant extends
  React.Component<GardenPlantProps, Partial<GardenPlantState>> {

  state: GardenPlantState = { icon: DEFAULT_ICON };

  componentDidMount() {
    let OFS = this.props.plant.body.openfarm_slug;
    cachedIcon(OFS)
      .then(({ svg_icon }) => {
        this.setState({ icon: svgToUrl(svg_icon) });
      });
  }

  render() {
    let { selected, plant, onClick, dispatch, quadrant } = this.props;
    let { radius, x, y } = plant.body;
    let { icon } = this.state;

    let action = { type: "TOGGLE_HOVERED_PLANT", payload: { plant, icon } };
    let { qx, qy } = getXYFromQuadrant(round(x), round(y), quadrant);

    return <g>
      <Circle
        className="plant-indicator"
        x={qx}
        y={qy}
        r={radius}
        selected={selected}
      />

      <image
        className={"plant-image is-chosen-" + selected}
        xlinkHref={this.state.icon}
        onClick={() => onClick(this.props.plant)}
        onMouseEnter={() => dispatch(action)}
        onMouseLeave={() => dispatch(action)}
        height={radius * 2}
        width={radius * 2}
        x={qx - radius}
        y={qy - radius}
      />
    </g>;
  }
}
