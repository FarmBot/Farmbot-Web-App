import * as React from "react";
import { ActivePlantDragHelperProps } from "../interfaces";
import { DragHelpers } from "./drag_helpers";

/**
 * For showing drag helpers for the selected plant.
 * This component must be rendered after (in front of) the hovered plant
 * component.
 */

export class ActivePlantDragHelper extends
  React.Component<ActivePlantDragHelperProps, {}> {
  render() {
    const { dragging, currentPlant, zoomLvl, activeDragXY,
      mapTransformProps, plantAreaOffset, editing } = this.props;

    return <g id="active-plant-drag-helper">
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
