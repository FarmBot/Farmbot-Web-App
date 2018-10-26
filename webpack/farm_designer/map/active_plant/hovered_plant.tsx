import * as React from "react";
import { DesignerState } from "../../interfaces";
import { transformXY, round } from "../util";
import { MapTransformProps, TaggedPlant } from "../interfaces";
import { SpreadCircle } from "../layers/spread/spread_layer";
import { Circle } from "../layers/plants/circle";
import * as _ from "lodash";

/**
 * For showing the map plant hovered in the plant panel.
 * This component must be rendered after (in front of) the plant layer
 * and before (behind) the drag helper component.
 */

export interface HoveredPlantProps {
  visible: boolean;
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
      animate
    } = this.props;
    const { icon } = designer.hoveredPlant;
    const hovered = !!icon;
    const { id, x, y, radius } = this.plantInfo;
    const { qx, qy } = transformXY(round(x), round(y), mapTransformProps);
    const scaledRadius = currentPlant ? radius : radius * 1.2;
    const alpha = dragging ? 0.4 : 1.0;

    return <g id="hovered-plant">
      {visible && hovered &&
        <g id={"hovered-plant-" + id}>
          {currentPlant &&
            <g id="selected-plant-indicators">
              <SpreadCircle
                plant={currentPlant}
                key={currentPlant.uuid}
                mapTransformProps={mapTransformProps}
                selected={false}
                animate={animate} />

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
