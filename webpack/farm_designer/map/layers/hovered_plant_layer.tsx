import * as React from "react";
import { TaggedPlantPointer } from "farmbot";
import { DesignerState } from "../../interfaces";
import { transformXY, round } from "../util";
import { MapTransformProps } from "../interfaces";
import { SpreadCircle } from "./spread_layer";
import { Circle } from "../circle";
import * as _ from "lodash";
import { Session } from "../../../session";
import { BooleanSetting } from "../../../session_keys";

/**
 * For showing the map plant hovered in the plant panel.
 * This layer must be rendered after the plant layer
 * and before the drag helper layer.
 */

export interface HoveredPlantLayerProps {
  visible: boolean;
  currentPlant: TaggedPlantPointer | undefined;
  designer: DesignerState;
  hoveredPlant: TaggedPlantPointer | undefined;
  isEditing: boolean;
  mapTransformProps: MapTransformProps;
  dragging: boolean;
}

export class HoveredPlantLayer extends
  React.Component<HoveredPlantLayerProps, {}> {

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
      currentPlant, mapTransformProps, dragging, isEditing, visible, designer
    } = this.props;
    const { icon } = designer.hoveredPlant;
    const hovered = !!icon;
    const { id, x, y, radius } = this.plantInfo;
    const { qx, qy } = transformXY(round(x), round(y), mapTransformProps);
    const scaledRadius = currentPlant ? radius : radius * 1.2;
    const alpha = dragging ? 0.4 : 1.0;
    const animate = !Session.deprecatedGetBool(BooleanSetting.disable_animations);

    return <g id="hovered-plant-layer">
      {visible && hovered &&
        <g id={"hovered-plant-" + id}>
          {currentPlant &&
            <g id="selected-plant-indicators">
              <SpreadCircle
                plant={currentPlant}
                key={currentPlant.uuid}
                mapTransformProps={mapTransformProps}
                selected={false} />

              <Circle
                className={animate ? "plant-indicator" : ""}
                x={qx}
                y={qy}
                r={radius}
                selected={true} />
            </g>}

          <g id="hovered-plant-icon">
            <image
              visibility={hovered ? "visible" : "hidden"}
              style={isEditing ? {} : { pointerEvents: "none" }}
              onClick={_.noop}
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
