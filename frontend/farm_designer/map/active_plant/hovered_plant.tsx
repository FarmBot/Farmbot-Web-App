import React from "react";
import { DesignerState } from "../../interfaces";
import { transformXY, round, scaleIcon } from "../util";
import { MapTransformProps, TaggedPlant } from "../interfaces";
import { Circle } from "../layers/plants/circle";
import { noop } from "lodash";
import { SpreadCircle } from "../layers";
import { findIcon } from "../../../crops/find";

/**
 * For showing the map plant hovered in the plant panel.
 * This component must be rendered after (in front of) the plant layer
 * and before (behind) the drag helper component.
 */

export interface HoveredPlantProps {
  visible: boolean;
  spreadLayerVisible: boolean;
  currentPlant: TaggedPlant | undefined;
  designer: DesignerState;
  hoveredPlant: TaggedPlant | undefined;
  isEditing: boolean;
  mapTransformProps: MapTransformProps;
  dragging: boolean;
  animate: boolean;
}

export class HoveredPlant extends
  React.Component<HoveredPlantProps, {}> {

  /** Safe fallbacks if no hovered plant is found. */
  get plantInfo() {
    if (this.props.hoveredPlant) {
      const { id, x, y, radius } = this.props.hoveredPlant.body;
      return { id, x, y, radius };
    } else {
      return { id: 0, x: 0, y: 0, radius: 1 };
    }
  }

  render() {
    const {
      currentPlant, mapTransformProps, dragging, isEditing, visible, designer,
      animate, spreadLayerVisible,
    } = this.props;
    const { plantUUID } = designer.hoveredPlant;
    const hovered = !!plantUUID;
    const { id, x, y } = this.plantInfo;
    const radius = designer.hoveredSpread
      ? designer.hoveredSpread / 2
      : this.plantInfo.radius;
    const { qx, qy } = transformXY(round(x), round(y), mapTransformProps);
    const icon = currentPlant ? findIcon(currentPlant.body.openfarm_slug) : "";
    const iconRadius = scaleIcon(radius);
    const scaledRadius = currentPlant ? iconRadius : iconRadius * 1.2;
    const alpha = dragging ? 0.4 : 1.0;

    return <g id="hovered-plant">
      {visible && hovered &&
        <g id={"hovered-plant-" + id}>
          {currentPlant &&
            <g id="selected-plant-spread-indicator">
              <SpreadCircle
                plant={currentPlant}
                key={currentPlant.uuid}
                selected={true}
                mapTransformProps={mapTransformProps}
                visible={!spreadLayerVisible}
                hoveredSpread={designer.hoveredSpread}
                animate={animate} />
            </g>}
          <g id="plant-indicator">
            <Circle
              className={`plant-indicator ${animate ? "animate" : ""}`}
              x={qx}
              y={qy}
              r={scaledRadius}
              selected={true} />
          </g>
          <g id="hovered-plant-icon">
            <image
              visibility={"visible"}
              style={isEditing ? {} : { pointerEvents: "none" }}
              onClick={noop}
              className="hovered-plant-copy"
              opacity={alpha}
              x={qx - scaledRadius}
              y={qy - scaledRadius}
              width={scaledRadius * 2}
              height={scaledRadius * 2}
              xlinkHref={icon} />
          </g>
        </g>
      }
    </g>;
  }
}
