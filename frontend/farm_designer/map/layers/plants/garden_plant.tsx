import React from "react";
import { GardenPlantProps, GardenPlantState } from "../../interfaces";
import { transformXY, scaleIcon } from "../../util";
import { DragHelpers } from "../../active_plant/drag_helpers";
import { Color } from "../../../../ui";
import { Actions } from "../../../../constants";
import { clickMapPlant } from "../../actions";
import { Circle } from "./circle";
import { SpecialStatus } from "farmbot";
import { findIcon } from "../../../../crops/find";

export class GardenPlant extends
  React.Component<GardenPlantProps, Partial<GardenPlantState>> {

  state: GardenPlantState = { hover: false };

  click = () => {
    this.props.dispatch(clickMapPlant(this.props.uuid));
  };

  iconHover = (action: "start" | "end") => {
    const hovered = action === "start";
    this.props.dispatch({
      type: Actions.HOVER_PLANT_LIST_ITEM,
      payload: hovered ? this.props.uuid : undefined
    });
    this.setState({ hover: hovered });
  };

  get grayscale() {
    const { plant } = this.props;
    const unsaved = plant.specialStatus !== SpecialStatus.SAVED;
    const gridPlant = plant.kind == "Point" && plant.body.meta.gridId;
    const maybeGrayscale = (gridPlant && unsaved) ? "url(#grayscale)" : "";
    return maybeGrayscale;
  }

  // eslint-disable-next-line complexity
  render() {
    const {
      current, selected, dragging, plant, mapTransformProps,
      activeDragXY, zoomLvl, animate, editing, hovered, hoveredSpread,
    } = this.props;
    const { id, x, y } = plant.body;
    const { hover } = this.state;
    const radius = (current || selected) && hoveredSpread
      ? hoveredSpread / 2
      : plant.body.radius;
    const icon = findIcon(plant.body.openfarm_slug);
    const plantIconSize = scaleIcon(radius);
    const iconRadius = hover ? plantIconSize * 1.1 : plantIconSize;
    const { qx, qy } = transformXY(x, y, mapTransformProps);
    const alpha = dragging ? 0.4 : 1.0;
    const newClass = id ? "" : "new";
    const className = [
      "plant-image",
      newClass,
      `is-chosen-${current || selected}`,
      animate ? "animate" : "",
    ].join(" ");

    return <g id={"plant-" + id}>
      <filter id="grayscale">
        <feColorMatrix type="saturate" values="0" />
      </filter>

      {animate &&
        <circle
          className={`soil-cloud ${newClass}`}
          cx={qx}
          cy={qy}
          r={plantIconSize}
          fill={Color.soilCloud}
          fillOpacity={0} />}

      {(current || selected) && !editing && !hovered &&
        <g id="selected-plant-indicator">
          <Circle
            className={`plant-indicator ${animate ? "animate" : ""}`}
            x={qx}
            y={qy}
            r={plantIconSize}
            selected={true} />
        </g>}

      <g id="plant-icon">
        <image
          onMouseEnter={() => this.iconHover("start")}
          onMouseLeave={() => this.iconHover("end")}
          visibility={dragging ? "hidden" : "visible"}
          className={className}
          opacity={alpha}
          filter={this.grayscale}
          xlinkHref={icon}
          onClick={this.click}
          height={iconRadius * 2}
          width={iconRadius * 2}
          x={qx - iconRadius}
          y={qy - iconRadius} />
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
