import * as React from "react";
import { GardenPlantProps, GardenPlantState } from "./interfaces";
import { cachedCrop, DEFAULT_ICON, svgToUrl } from "../../open_farm/index";
import { round, getXYFromQuadrant } from "./util";
import { DragHelpers } from "./drag_helpers";

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

  click = () => {
    this.props.dispatch({ type: "SELECT_PLANT", payload: this.props.uuid });
    this.props.dispatch({
      type: "TOGGLE_HOVERED_PLANT", payload: {
        plantUUID: this.props.uuid, icon: this.state.icon
      }
    });
  };

  render() {
    const { selected, dragging, plant, mapTransformProps,
      activeDragXY, zoomLvl } = this.props;
    const { quadrant, gridSize } = mapTransformProps;
    const { id, radius, x, y } = plant.body;
    const { icon } = this.state;

    const { qx, qy } = getXYFromQuadrant(round(x), round(y), quadrant, gridSize);
    const alpha = dragging ? 0.4 : 1.0;

    return <g id={"plant-" + id}>

      <circle
        className="soil-cloud"
        cx={qx}
        cy={qy}
        r={radius}
        fill="#90612f"
        fillOpacity="0" />

      <g id="plant-icon">
        <image
          visibility={dragging ? "hidden" : "visible"}
          className={"plant-image is-chosen-" + selected}
          opacity={alpha}
          xlinkHref={icon}
          onClick={this.click}
          height={radius * 2}
          width={radius * 2}
          x={qx - radius}
          y={qy - radius} />
      </g>

      <DragHelpers // for inactive plants
        dragging={dragging}
        plant={plant}
        mapTransformProps={mapTransformProps}
        zoomLvl={zoomLvl}
        activeDragXY={activeDragXY}
        plantAreaOffset={{ x: 0, y: 0 }} />
    </g>;
  }
}
