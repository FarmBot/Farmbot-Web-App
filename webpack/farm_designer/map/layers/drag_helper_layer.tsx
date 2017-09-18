import * as React from "react";
import { TaggedPlantPointer } from "../../../resources/tagged_resources";
import { MapTransformProps, AxisNumberProperty } from "../interfaces";
import { DragHelpers } from "../drag_helpers";
import { BotPosition } from "../../../devices/interfaces";

/**
 * For showing drag helpers for the selected plant.
 * This layer must be rendered after the hovered plant layer.
 */

export interface DragHelperLayerProps {
  currentPlant: TaggedPlantPointer | undefined;
  mapTransformProps: MapTransformProps;
  dragging: boolean;
  editing: boolean;
  zoomLvl: number;
  activeDragXY: BotPosition | undefined;
  plantAreaOffset: AxisNumberProperty;
}

export class DragHelperLayer extends
  React.Component<DragHelperLayerProps, {}> {

  get plantInfo() {
    if (this.props.currentPlant) {
      const { x, y, radius } = this.props.currentPlant.body;
      return { x, y, radius };
    } else {
      return { x: 0, y: 0, radius: 0 };
    }
  }
  render() {
    const { dragging, currentPlant, zoomLvl, activeDragXY,
      mapTransformProps, plantAreaOffset, editing } = this.props;

    return <g id="drag-helper-layer">
      {currentPlant && editing &&
        <DragHelpers // for active plants
          dragging={dragging}
          plant={currentPlant}
          mapTransformProps={mapTransformProps}
          zoomLvl={zoomLvl}
          activeDragXY={activeDragXY}
          plantAreaOffset={plantAreaOffset} />}
    </g>;
  }
}
