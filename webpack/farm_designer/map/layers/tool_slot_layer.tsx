import * as React from "react";
import { SlotWithTool } from "../../../resources/interfaces";
import { ToolSlotPoint } from "../tool_slot_point";
import { MapTransformProps } from "../interfaces";
import { history, getPathArray } from "../../../history";
import { getMode, Mode } from "../garden_map";

export interface ToolSlotLayerProps {
  visible: boolean;
  slots: SlotWithTool[];
  mapTransformProps: MapTransformProps;
  dispatch: Function;
}

export function ToolSlotLayer(props: ToolSlotLayerProps) {
  const pathArray = getPathArray();
  const canClickTool = !(pathArray[3] === "plants" && pathArray.length > 4);
  function goToToolsPage() {
    if (canClickTool) {
      history.push("/app/tools");
    }
  }
  const { slots, visible, mapTransformProps } = props;
  const cursor = canClickTool ? "pointer" : "default";

  const maybeNoPointer = (): React.SVGProps<SVGGElement>["style"] => {
    switch (getMode()) {
      case Mode.boxSelect:
      case Mode.clickToAdd:
      case Mode.moveTo:
      case Mode.createPoint:
        return { "pointerEvents": "none" };
      default:
        return { cursor: cursor };
    }
  };

  return <g
    id="toolslot-layer"
    onClick={goToToolsPage}
    style={maybeNoPointer()}>
    {visible &&
      slots.map(slot =>
        <ToolSlotPoint
          key={slot.toolSlot.uuid}
          slot={slot}
          mapTransformProps={mapTransformProps} />
      )}
  </g>;
}
