import * as React from "react";
import { GardenPlantProps, GardenPlantState } from "./interfaces";
import { cachedCrop, DEFAULT_ICON, svgToUrl } from "../../open_farm/index";
import { Circle } from "./circle";
import { round, getXYFromQuadrant } from "./util";
import { DragHelpers } from "./drag_helpers";
import { SpreadOverlapHelper } from "./spread_overlap_helper";

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
      zoomLvl, activeDragXY, mapTransformProps, plantAreaOffset,
      activeDragSpread } = this.props;
    const { quadrant, gridSize } = mapTransformProps;
    const { radius, x, y } = plant.body;
    const { icon } = this.state;

    const action = { type: "TOGGLE_HOVERED_PLANT", payload: { plant, icon } };
    const { qx, qy } = getXYFromQuadrant(round(x), round(y), quadrant, gridSize);
    const alpha = dragging ? 0.4 : 1.0;

    return <g>

      <circle
        className="soil-cloud"
        cx={qx}
        cy={qy}
        r={radius}
        fill="#90612f"
        fillOpacity="0" />

      <SpreadOverlapHelper
        dragging={dragging}
        plant={plant}
        mapTransformProps={mapTransformProps}
        zoomLvl={zoomLvl}
        activeDragXY={activeDragXY}
        activeDragSpread={activeDragSpread} />

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

      <DragHelpers
        dragging={dragging}
        plant={plant}
        mapTransformProps={mapTransformProps}
        zoomLvl={zoomLvl}
        activeDragXY={activeDragXY}
        plantAreaOffset={plantAreaOffset} />
    </g>;
  }
}
