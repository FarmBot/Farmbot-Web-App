import * as React from "react";
import { DragHelperLayerProps } from "../interfaces";
import { DragHelpers } from "../drag_helpers";

/**
 * For showing drag helpers for the selected plant.
 * This layer must be rendered after the hovered plant layer.
 */

export class DragHelperLayer extends
  React.Component<DragHelperLayerProps, {}> {
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
