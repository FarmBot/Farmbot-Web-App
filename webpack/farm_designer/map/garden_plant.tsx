import * as React from "react";
import { GardenPlantProps, GardenPlantState } from "./interfaces";
import { cachedCrop, DEFAULT_ICON, svgToUrl } from "../../open_farm/icons";
import { round, getXYFromQuadrant } from "./util";
import { DragHelpers } from "./drag_helpers";
import { Session } from "../../session";
import { BooleanSetting } from "../../session_keys";
import { Color } from "../../ui/index";
import { Actions } from "../../constants";

export class GardenPlant extends
  React.Component<GardenPlantProps, Partial<GardenPlantState>> {

  state: GardenPlantState = { icon: DEFAULT_ICON, hover: false };

  componentDidMount() {
    const OFS = this.props.plant.body.openfarm_slug;
    cachedCrop(OFS)
      .then(({ svg_icon }) => {
        this.setState({ icon: svgToUrl(svg_icon) });
      });
  }

  click = () => {
    this.props.dispatch({
      type: Actions.SELECT_PLANT,
      payload: [this.props.uuid]
    });
    this.props.dispatch({
      type: Actions.TOGGLE_HOVERED_PLANT, payload: {
        plantUUID: this.props.uuid, icon: this.state.icon
      }
    });
  };

  iconHover = (action: "start" | "end") => {
    const hovered = action === "start";
    this.props.dispatch({
      type: Actions.HOVER_PLANT_LIST_ITEM,
      payload: hovered ? this.props.uuid : undefined
    });
    this.setState({ hover: hovered ? true : false });
  };

  get radius() {
    const { selected, plant } = this.props;
    const { hover } = this.state;
    const { radius } = plant.body;
    return (hover && !selected) ? radius * 1.1 : radius;
  }

  render() {
    const { selected, dragging, plant, grayscale, mapTransformProps,
      activeDragXY, zoomLvl } = this.props;
    const { quadrant, gridSize } = mapTransformProps;
    const { id, radius, x, y } = plant.body;
    const { icon } = this.state;

    const { qx, qy } = getXYFromQuadrant(round(x), round(y), quadrant, gridSize);
    const alpha = dragging ? 0.4 : 1.0;
    const animate = !Session.deprecatedGetBool(BooleanSetting.disable_animations);

    return <g id={"plant-" + id}>

      <filter id="grayscale">
        <feColorMatrix type="saturate" values="0" />
      </filter>

      {animate &&
        <circle
          className="soil-cloud"
          cx={qx}
          cy={qy}
          r={radius}
          fill={Color.soilCloud}
          fillOpacity="0" />}

      <g id="plant-icon">
        <image
          onMouseEnter={() => this.iconHover("start")}
          onMouseLeave={() => this.iconHover("end")}
          visibility={dragging ? "hidden" : "visible"}
          className={`plant-image is-chosen-${selected} ${animate ? "animate" : ""}`}
          filter={(grayscale && !selected) ? "url(#grayscale)" : ""}
          opacity={alpha}
          xlinkHref={icon}
          onClick={this.click}
          height={this.radius * 2}
          width={this.radius * 2}
          x={qx - this.radius}
          y={qy - this.radius} />
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
