import * as React from "react";
import { SlotWithTool } from "../../../../resources/interfaces";
import { ToolSlotPoint } from "./tool_slot_point";
import { MapTransformProps } from "../../interfaces";
import { history, getPathArray } from "../../../../history";
import { maybeNoPointer } from "../../util";

export interface ToolSlotLayerProps {
  visible: boolean;
  slots: SlotWithTool[];
  mapTransformProps: MapTransformProps;
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

  return <g
    id="toolslot-layer"
    onClick={goToToolsPage}
    style={maybeNoPointer({ cursor: cursor })}>
    {visible &&
      slots.map(slot =>
        <ToolSlotPoint
          key={slot.toolSlot.uuid}
          slot={slot}
          mapTransformProps={mapTransformProps} />
      )}
  </g>;
}
